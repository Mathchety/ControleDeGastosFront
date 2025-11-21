import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProcessingNotification({
  visible,
  message = 'Processando nota fiscal...',
  progressDuration = null, // ms, if set animates progress bar over this duration
  progressColor = '#667eea',
  isOffline = false,
}) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calcula o top baseado na Dynamic Island/Notch/StatusBar
  // insets.top detecta automaticamente o tamanho da ilha, notch ou status bar
  const topPosition = Platform.OS === 'ios' 
    ? insets.top + 10  // iPhone com Dynamic Island (>54px) ou notch (>40px)
    : (insets.top > 24 ? insets.top + 10 : insets.top + 15); // Android com furo/notch

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

      // Se houver duração de progresso, anima a barra de 0->1
      if (progressDuration && progressDuration > 0) {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: progressDuration,
          useNativeDriver: false,
        }).start();
      }
    } else {
      // Animação de slide para cima (esconder)
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // reset progress
      progressAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Ajusta aparência quando for aviso offline
  const accentColor = isOffline ? '#fb923c' : progressColor; // laranja para offline
  const titleText = isOffline ? 'Sem conexão' : 'Processando...';

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
          // Borda laranja visível quando offline
          borderLeftWidth: isOffline ? 6 : 0,
          borderLeftColor: isOffline ? '#fb923c' : 'transparent',
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size="small" color={accentColor} style={styles.loader} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isOffline ? { color: '#b45309' } : null]}>{titleText}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <Ionicons name={isOffline ? 'alert-circle-outline' : 'hourglass-outline'} size={24} color={accentColor} />
      </View>
      
      {/* Barra de progresso animada */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: accentColor,
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
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
