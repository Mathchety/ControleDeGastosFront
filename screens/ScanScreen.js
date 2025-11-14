import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Animated, Easing, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import useErrorModal from '../hooks/useErrorModal';
import { ErrorModal, CameraPermissionModal } from '../components/modals';
import { validateQRCode } from '../utils/qrCodeValidator'; // 🗺️ Validador de QR Code

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanTimeout, setScanTimeout] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false); // 🔒 Modal de permissão

  const { loading: contextLoading, previewQRCode } = useData();
  const { errorState, showError, hideError } = useErrorModal();
  const loading = contextLoading || localLoading;
  
  const scanTimeoutRef = useRef(null);

  // Animação da tela de scan (fecha a câmera)
  const screenAnim = useRef(new Animated.Value(1)).current; // 1 = aberto, 0 = fechado
  const successAnim = useRef(new Animated.Value(0)).current; // Animação do ícone de sucesso

  useEffect(() => {
    if (permission && permission.status !== 'granted') {
      setShowPermissionModal(true);
    } else {
      setShowPermissionModal(false);
    }
  }, [permission]);

  // Timeout removido: não inicia mais automaticamente ao abrir a tela

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
    
    // �️ Valida QR Code com suporte a todas as regiões do Brasil
    const validation = validateQRCode(data);
    
    if (!validation.valid) {
      // Limpa o timeout pois não é mais necessário (QR inválido não envia pro backend)
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      
      let title, message;
      
      if (validation.state) {
        // Estado brasileiro não suportado ainda
        title = 'Estado Não Suportado';
        message = `Em breve adicionaremos suporte para ${validation.state}!`;
      } else {
        // Não é um QR Code de Nota Fiscal Eletrônica
        title = 'QR Code Inválido';
        message = 'Este não é um QR Code de Nota Fiscal Eletrônica.\n\nPor favor, escaneie o QR Code de uma nota fiscal válida.';
      }
      
      // Mostra erro usando nosso componente personalizado
      showError(title, message, () => {
        // Permite escanear novamente após fechar o modal
        setScanned(false);
      });
      
      return;
    }
    
    // QR Code válido (Paraná)
    // Limpa o timeout ao escanear com sucesso
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
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
        navigation.replace('Preview', { 
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
      // Limpa o timeout em caso de erro
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      
      setLocalLoading(false);
      setScanned(false);
      setShowSuccess(false);
      screenAnim.setValue(1);
      successAnim.setValue(0);
      
      // Usa o modal de erro personalizado
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

      {/* Modal de Erro Personalizado */}
      <ErrorModal
        visible={errorState.visible}
        title={errorState.title}
        message={errorState.message}
        onClose={hideError}
      />

      {/* 🔒 Modal de Permissão de Câmera */}
      <CameraPermissionModal
        visible={showPermissionModal}
        onAllow={async () => {
          const result = await requestPermission();
          if (result?.granted) {
            setShowPermissionModal(false);
          }
        }}
        onCancel={() => {
          setShowPermissionModal(false);
          navigation.goBack();
        }}
      />
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
