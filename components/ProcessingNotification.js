import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProcessingNotification({ visible, message = "Processando nota fiscal..." }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calcula o top baseado na StatusBar e safe area
  const topPosition = Platform.OS === 'android' ? insets.top + 10 : 10;

  useEffect(() => {
    if (visible) {
      // Animação de slide para baixo
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Animação de pulso contínua
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Animação de slide para cima (esconder)
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topPosition,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size="small" color="#667eea" style={styles.loader} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Processando...</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <Ionicons name="hourglass-outline" size={24} color="#667eea" />
      </View>
      
      {/* Barra de progresso animada */}
      <View style={styles.progressBar}>
        <Animated.View style={styles.progressFill} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#666',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#667eea',
  },
});
