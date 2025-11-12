import React from 'react';
import { View } from 'react-native';
import Svg, { 
    Circle, 
    Rect, 
    Path, 
    Defs, 
    LinearGradient, 
    Stop 
} from 'react-native-svg';

/**
 * 🎨 Logo Finansync - Componente SVG
 * 
 * @param {number} size - Tamanho do logo (padrão: 120)
 * @param {boolean} showCircle - Mostrar círculo de fundo (padrão: true)
 */
export default function FinansyncLogo({ size = 120, showCircle = true }) {
    const scale = size / 512; // Scale baseado no SVG original de 512x512

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 512 512">
                <Defs>
                    {/* Gradiente principal (roxo) */}
                    <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
                    </LinearGradient>
                    
                    {/* Gradiente de destaque (azul/ciano) */}
                    <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#4facfe" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#00f2fe" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Fundo circular (opcional) */}
                {showCircle && (
                    <Circle cx="256" cy="256" r="240" fill="url(#mainGradient)" />
                )}

                {/* Círculos decorativos internos */}
                {showCircle && (
                    <>
                        <Circle cx="256" cy="256" r="200" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.1" />
                        <Circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
                    </>
                )}

                {/* Gráfico de barras crescente */}
                <Rect x="186" y="190" width="28" height="35" rx="5" fill="#ffffff" opacity="0.7" />
                <Rect x="221" y="170" width="28" height="55" rx="5" fill="#ffffff" opacity="0.85" />
                <Rect x="256" y="145" width="28" height="80" rx="5" fill="url(#accentGradient)" opacity="0.95" />
                <Rect x="291" y="115" width="28" height="110" rx="5" fill="url(#accentGradient)" opacity="0.95" />

                {/* Seta para cima (crescimento) */}
                <Path 
                    d="M 306 90 L 326 110 L 316 110 L 316 130 L 296 130 L 296 110 L 286 110 Z" 
                    fill="#ffffff" 
                    opacity="0.95"
                />

                {/* Pontos decorativos minimalistas */}
                {showCircle && (
                    <>
                        <Circle cx="120" cy="140" r="4" fill="#ffffff" opacity="0.4" />
                        <Circle cx="392" cy="370" r="4" fill="#ffffff" opacity="0.4" />
                        <Circle cx="400" cy="160" r="3" fill="#ffffff" opacity="0.3" />
                        <Circle cx="112" cy="380" r="3" fill="#ffffff" opacity="0.3" />
                    </>
                )}
            </Svg>
        </View>
    );
}
