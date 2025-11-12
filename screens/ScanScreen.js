import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Alert, Animated, Easing, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import useErrorModal from '../hooks/useErrorModal';
import { ErrorModal } from '../components/modals';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanTimeout, setScanTimeout] = useState(false);

  const { loading: contextLoading, previewQRCode } = useData();
  const { errorState, showError, hideError } = useErrorModal();
  const loading = contextLoading || localLoading;
  
  const scanTimeoutRef = useRef(null);

  // Animação da tela de scan (fecha a câmera)
  const screenAnim = useRef(new Animated.Value(1)).current; // 1 = aberto, 0 = fechado
  const successAnim = useRef(new Animated.Value(0)).current; // Animação do ícone de sucesso

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // ⏱️ Timeout de 30 segundos para escanear
  useEffect(() => {
    // Inicia timeout quando a tela recebe foco
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setScanTimeout(false);
      
      // Limpa timeout anterior se existir
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      // Define novo timeout de 30 segundos
      scanTimeoutRef.current = setTimeout(() => {
        if (!scanned) {
          setScanTimeout(true);
          Alert.alert(
            'Tempo Esgotado',
            'Não foi possível escanear o QR Code.\nTente novamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setScanTimeout(false);
                  setScanned(false);
                }
              }
            ]
          );
        }
      }, 30000); // 30 segundos
    });

    // Limpa timeout quando sair da tela
    const unsubscribeBlur = navigation.addListener('blur', () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [navigation, scanned]);

  // Reset scanner quando a tela voltar a foco (permite escanear novamente)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setScannedData(null);
      setLocalLoading(false);
      setShowSuccess(false);
      setScanTimeout(false);
      screenAnim.setValue(1);
      successAnim.setValue(0);
    });
    return unsubscribe;
  }, [navigation]);

  // Ao ler o QR: processa e navega para Preview
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading || scanTimeout) return;
    
    // 🔍 Validar se é uma nota fiscal do Paraná (.pr)
    const qrLink = data.toLowerCase();
    if (!qrLink.includes('.pr')) {
      Alert.alert(
        'Nota Fiscal Inválida',
        'Este aplicativo só aceita notas fiscais eletrônicas do Paraná.\n\nProcure por links contendo ".pr" no QR Code.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Permite escanear novamente
              setScanned(false);
            }
          }
        ]
      );
      return;
    }
    
    // Limpa o timeout ao escanear com sucesso
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    setScanned(true);
    setScannedData(data);
    setLocalLoading(true);

    try {
      // Chama o preview
      const previewData = await previewQRCode(data);

      // Mostra animação de sucesso
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 200, // ✨ Reduzido de 300ms para 200ms
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.delay(300), // ✨ Reduzido de 400ms para 300ms
      ]).start(() => {
        // ✨ Navega DIRETAMENTE sem animação de fechadura
        navigation.navigate('Preview', { 
          previewData,
          qrLink: data 
        });
        
        // Reset após navegar
        setTimeout(() => {
          setLocalLoading(false);
          setShowSuccess(false);
          successAnim.setValue(0);
          screenAnim.setValue(1);
        }, 100);
      });

    } catch (error) {
      setLocalLoading(false);
      setScanned(false);
      setShowSuccess(false);
      screenAnim.setValue(1);
      successAnim.setValue(0);
      
      // ✨ Usa o modal bonito de erro ao invés do Alert.alert simples
      showError(error, 'Não foi possível processar a nota fiscal');
      
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={80} color="#ccc" />
        <Text style={styles.message}>Permissão de câmera necessária</Text>
        <Button onPress={requestPermission} title="Permitir Câmera" />
      </View>
    );
  }

  // Interpolations para animar a tela inteira de camera/overlay
  const interpolatedStyle = {
    opacity: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
    transform: [
      { scale: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      { translateY: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <Animated.View style={[StyleSheet.absoluteFillObject, interpolatedStyle]}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Escanear QR Code</Text>
          </View>

          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              
              {/* Loading quando QR Code é detectado */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingContent}>
                    {!showSuccess ? (
                      <>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.loadingText}>Processando...</Text>
                        <Text style={styles.loadingSubText}>Identificando nota fiscal</Text>
                      </>
                    ) : (
                      <Animated.View style={{
                        transform: [
                          { scale: successAnim },
                          { 
                            rotate: successAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }
                        ],
                        opacity: successAnim,
                      }}>
                        <View style={styles.successCircle}>
                          <Ionicons name="checkmark" size={60} color="#fff" />
                        </View>
                      </Animated.View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Instrução quando não está processando */}
            {!loading && !scanTimeout && (
              <Text style={styles.instructionText}>
                Posicione o QR Code da nota fiscal dentro do quadro
              </Text>
            )}
            
            {/* Mensagem de timeout */}
            {scanTimeout && (
              <View style={styles.timeoutContainer}>
                <Ionicons name="time-outline" size={40} color="#ef4444" />
                <Text style={styles.timeoutText}>Tempo esgotado</Text>
                <Text style={styles.timeoutSubText}>Toque para tentar novamente</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSubText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#667eea',
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeoutContainer: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  timeoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  timeoutSubText: {
    fontSize: 14,
    color: '#fca5a5',
    marginTop: 5,
    textAlign: 'center',
  },
});
