import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { confirmQRCode, loading } = useData();

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.message}>Verificando permissão...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-off" size={80} color="#999" />
        <Text style={styles.message}>Permissão de câmera necessária</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);

    Alert.alert(
      'Nota Fiscal Encontrada',
      'Deseja processar esta nota fiscal com IA?',
      [
        { text: 'Cancelar', onPress: () => setScanned(false), style: 'cancel' },
        {
          text: 'Processar',
          onPress: async () => {
            try {
              const receipt = await confirmQRCode(data);
              Alert.alert(
                'Sucesso! 🎉',
                `Nota processada!\n\nTotal: R$ ${receipt.total}\nItens: ${receipt.items?.length || 0}`,
                [
                  { text: 'Ver Dashboard', onPress: () => navigation.navigate('Home') },
                  { text: 'Escanear Outra', onPress: () => setScanned(false) },
                ]
              );
            } catch (error) {
              Alert.alert('Erro', error.message || 'Erro ao processar nota');
              setScanned(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
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
                <Text style={styles.loadingText}>Processando com IA...</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.instructionText}>
            {loading
              ? 'Aguarde, processando nota fiscal...'
              : 'Posicione o QR Code da nota fiscal no centro'}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.infoText}>
              O QR Code está no rodapé da nota fiscal eletrônica (NFC-e)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  message: { fontSize: 18, color: '#666', marginTop: 20, textAlign: 'center' },
  retryButton: { marginTop: 20, backgroundColor: '#667eea', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 300, height: 300, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#fff', borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  loadingContainer: { alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 10, fontWeight: '600' },
  instructionText: { color: '#fff', fontSize: 16, marginTop: 30, textAlign: 'center', paddingHorizontal: 40, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  footer: { padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#666', lineHeight: 20 },
});
