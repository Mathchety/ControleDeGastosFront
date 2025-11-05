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

  const { loading: contextLoading, previewQRCode } = useData();
  const loading = contextLoading || localLoading;

  // Animação da tela de scan (fecha a câmera)
  const screenAnim = useRef(new Animated.Value(1)).current; // 1 = aberto, 0 = fechado

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
      screenAnim.setValue(1);
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
      // Anima a "fechadura" da tela: diminui e some
      Animated.timing(screenAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Chama o preview
      console.log('[Scan] QR Code lido:', data);
      const previewData = await previewQRCode(data);
      console.log('[Scan] Preview recebido');

      // Navega para tela de preview com os dados
      navigation.navigate('Preview', { 
        previewData,
        qrLink: data 
      });

      setLocalLoading(false);
    } catch (error) {
      setLocalLoading(false);
      setScanned(false);
      screenAnim.setValue(1);
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
            </View>

           
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
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
