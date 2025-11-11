import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Componente que faz fade-in de qualquer conteúdo
 * @param {Object} props
 * @param {Number} props.duration - Duração da animação em ms (default: 400)
 * @param {Number} props.delay - Delay antes de iniciar em ms (default: 0)
 * @param {React.ReactNode} props.children - Conteúdo a ser animado
 * @param {Object} props.style - Estilos adicionais
 */
export default function FadeInView({ 
    children, 
    duration = 400, 
    delay = 0, 
    style,
    translateY = 10 // Pequeno movimento vertical
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(translateY)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
                toValue: 0,
                duration,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateAnim }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}

/**
 * Componente para animar listas com stagger (itens aparecem em sequência)
 * @param {Object} props
 * @param {Array} props.data - Array de dados
 * @param {Function} props.renderItem - Função para renderizar cada item
 * @param {Number} props.staggerDelay - Delay entre cada item em ms (default: 50)
 */
export function StaggeredList({ data, renderItem, staggerDelay = 50, ...props }) {
    return (
        <>
            {data.map((item, index) => (
                <FadeInView key={index} delay={index * staggerDelay} {...props}>
                    {renderItem(item, index)}
                </FadeInView>
            ))}
        </>
    );
}
