import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const { loading: contextLoading } = useData();
  const loading = contextLoading || localLoading;

  // animação da tela de scan (fecha a câmera)
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

  // ao ler o QR: anima a tela de scan fechando, mostra loading e navega para Preview com o link
  const handleBarCodeScanned = ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setScannedData(data);

    // anima a "fechadura" da tela: diminui e some
    Animated.timing(screenAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // mostra overlay de loading e aguarda um instante antes de navegar
      setLocalLoading(true);
      setTimeout(() => {
        // navega para preview (Preview é responsável por chamar POST /scan-qrcode/preview e confirmar)
        navigation.navigate('Preview', { qrLink: data });
        // não resetar scanned aqui — será resetado no focus do Preview quando voltar
      }, 300);
    });
  };

  if (!permission) return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={80} color="#ccc" />
        <Text style={styles.message}>Permissão de câmera necessária</Text>
        <Button onPress={requestPermission} title="Permitir Câmera" />
      </View>
    );
  }

  // interpolations para animar a tela inteira de camera/overlay
  const interpolatedStyle = {
    opacity: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
    transform: [
      { scale: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      { translateY: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
    ],
  };

  return (
    <View style={styles.container}>
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

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Processando...</Text>
                </View>
              )}
            </View>

            <Text style={styles.instructionText}>
              {loading ? 'Aguarde, processando nota...' : 'Posicione o QR Code no centro'}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#333" />
              <Text style={styles.infoText}>O QR Code está no rodapé da NFC-e</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* overlay de loading fullscreen exibida após animação de fechamento */}
      {localLoading && (
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#00ff8c" />
          <Text style={styles.fullLoadingText}>Carregando preview...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { marginVertical: 16, textAlign: 'center', color: '#fff' },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: { height: 60, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },

  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: {
    width: 300,
    height: 300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderLeftWidth: 4, borderTopWidth: 4 },
  cornerTR: { top: 0, right: 0, borderRightWidth: 4, borderTopWidth: 4 },
  cornerBL: { bottom: 0, left: 0, borderLeftWidth: 4, borderBottomWidth: 4 },
  cornerBR: { bottom: 0, right: 0, borderRightWidth: 4, borderBottomWidth: 4 },

  loadingContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 8 },

  instructionText: { color: '#fff', marginTop: 16, textAlign: 'center', fontSize: 14 },

  footer: { height: 100, justifyContent: 'center', alignItems: 'center' },
  infoCard: { backgroundColor: '#fff', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 8, color: '#333' },

  // overlay full-screen que aparece enquanto o Preview é carregado
  fullLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  fullLoadingText: { color: '#00ff8c', marginTop: 12 },
});
