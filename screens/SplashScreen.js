import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FinansyncLogo } from '../components/common';
import { moderateScale } from '../utils/responsive';

export default function SplashScreen({ onFinish }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        // Resetar valores de animação
        scaleAnim.setValue(0);
        fadeAnim.setValue(0);
        pulseValue.setValue(1);

        // Animação em sequência
        const anim = Animated.sequence([
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
            // 3. Pulse (pulsação) ao invés de rotação
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseValue, {
                        toValue: 1.1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseValue, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ),
        ]);

        animationRef.current = anim;

        anim.start(() => {
            // Aguarda mais um pouco antes de finalizar
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 500);
        });

        // Cleanup ao desmontar
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, [onFinish, scaleAnim, fadeAnim, pulseValue]);

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
                                { scale: pulseValue }, // Pulse ao invés de rotate
                            ],
                        },
                    ]}
                >
                    <FinansyncLogo size={160} showCircle={false} />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.appName}>Finansync</Text>
                    <Text style={styles.tagline}>Sincronize suas finanças com inteligência</Text>
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
