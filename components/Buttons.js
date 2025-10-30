import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botão principal com gradiente
 * @param {string} title - Texto do botão
 * @param {function} onPress - Função ao pressionar
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {boolean} loading - Mostra loading
 * @param {array} colors - Cores do gradiente
 * @param {object} style - Estilos adicionais
 */
export const PrimaryButton = ({ 
    title, 
    onPress, 
    icon, 
    loading = false,
    colors = ['#007bff', '#0056b3'],
    style 
}) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={loading}>
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Text style={styles.buttonText}>{title}</Text>
                    {icon && <Ionicons name={icon} size={20} color="#fff" />}
                </>
            )}
        </LinearGradient>
    </TouchableOpacity>
);

/**
 * Botão secundário (outline)
 */
export const SecondaryButton = ({ title, onPress, icon, style }) => (
    <TouchableOpacity 
        style={[styles.secondaryButton, style]} 
        onPress={onPress}
    >
        {icon && <Ionicons name={icon} size={20} color="#667eea" style={{ marginRight: 8 }} />}
        <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
);

/**
 * Botão de ícone redondo
 */
export const IconButton = ({ icon, onPress, color = '#667eea', size = 40, style }) => (
    <TouchableOpacity 
        style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, style]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={size * 0.5} color={color} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#667eea',
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    iconButton: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
