import React from 'react';
import { View } from 'react-native';
import Svg, { 
    Rect, 
    Path, 
    Defs, 
    LinearGradient, 
    Stop 
} from 'react-native-svg';

/**
 * 🎨 Logo Finansync Simples - Apenas o símbolo (sem círculo, sem texto)
 * Perfeito para usar no header com fundo gradient
 * 
 * @param {number} size - Tamanho do logo (padrão: 60)
 */
export default function FinansyncLogoSimple({ size = 60 }) {
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox="0 0 140 140">
                <Defs>
                    {/* Gradiente de destaque (azul/ciano) */}
                    <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#4facfe" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#00f2fe" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Gráfico de barras crescente - centralizado */}
                <Rect x="20" y="70" width="18" height="23" rx="4" fill="#ffffff" opacity="0.7" />
                <Rect x="43" y="57" width="18" height="36" rx="4" fill="#ffffff" opacity="0.85" />
                <Rect x="66" y="40" width="18" height="53" rx="4" fill="url(#accentGradient)" opacity="0.95" />
                <Rect x="89" y="20" width="18" height="73" rx="4" fill="url(#accentGradient)" opacity="0.95" />

                {/* Seta para cima (crescimento) - centralizada */}
                <Path 
                    d="M 98 10 L 113 25 L 106 25 L 106 38 L 90 38 L 90 25 L 83 25 Z" 
                    fill="#ffffff" 
                    opacity="0.95"
                />
            </Svg>
        </View>
    );
}
