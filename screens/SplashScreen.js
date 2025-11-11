import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../utils/responsive';

export default function SplashScreen({ onFinish }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animação em sequência
        Animated.sequence([
            // 1. Ícone aparece com escala
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 10,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Pequena pausa
            Animated.delay(300),
            // 3. Rotação sutil
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Aguarda mais um pouco antes de finalizar
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 500);
        });
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.gradient}
            >
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { rotate: spin },
                            ],
                        },
                    ]}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name="receipt-outline" size={60} color="#fff" />
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.appName}>SmartReceipt</Text>
                    <Text style={styles.tagline}>Controle suas despesas com inteligência</Text>
                </Animated.View>

                {/* Indicador de Loading */}
                <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dotAnim1]} />
                        <View style={[styles.dot, styles.dotAnim2]} />
                        <View style={[styles.dot, styles.dotAnim3]} />
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: moderateScale(30),
    },
    iconCircle: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    appName: {
        fontSize: moderateScale(32),
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: moderateScale(8),
        letterSpacing: 1,
    },
    tagline: {
        fontSize: moderateScale(14),
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
        fontWeight: '400',
    },
    loadingContainer: {
        marginTop: moderateScale(60),
    },
    loadingDots: {
        flexDirection: 'row',
        gap: moderateScale(8),
    },
    dot: {
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: '#fff',
    },
    dotAnim1: {
        opacity: 0.4,
    },
    dotAnim2: {
        opacity: 0.7,
    },
    dotAnim3: {
        opacity: 1,
    },
});
