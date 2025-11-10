import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Alert, Animated, Easing, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { loading: contextLoading, previewQRCode } = useData();
  const loading = contextLoading || localLoading;

  // Animação da tela de scan (fecha a câmera)
  const screenAnim = useRef(new Animated.Value(1)).current; // 1 = aberto, 0 = fechado
  const successAnim = useRef(new Animated.Value(0)).current; // Animação do ícone de sucesso

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Reset scanner quando a tela voltar a foco (permite escanear novamente)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setScannedData(null);
      setLocalLoading(false);
      setShowSuccess(false);
      screenAnim.setValue(1);
      successAnim.setValue(0);
    });
    return unsubscribe;
  }, [navigation]);

  // Ao ler o QR: processa e navega para Preview
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setScannedData(data);
    setLocalLoading(true);

    try {
      // Chama o preview
      console.log('[Scan] QR Code lido:', data);
      const previewData = await previewQRCode(data);
      console.log('[Scan] Preview recebido');

      // Mostra animação de sucesso
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ]).start(() => {
        // Anima a "fechadura" da tela antes de navegar
        Animated.timing(screenAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          // Navega para tela de preview com os dados após animação
          navigation.navigate('Preview', { 
            previewData,
            qrLink: data 
          });
          setLocalLoading(false);
          setShowSuccess(false);
          successAnim.setValue(0);
        });
      });

    } catch (error) {
      setLocalLoading(false);
      setScanned(false);
      setShowSuccess(false);
      screenAnim.setValue(1);
      successAnim.setValue(0);
      Alert.alert('Erro', error.message || 'Não foi possível processar a nota fiscal');
      console.error('[Scan] Erro:', error);
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
            {!loading && (
              <Text style={styles.instructionText}>
                Posicione o QR Code da nota fiscal dentro do quadro
              </Text>
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
});
