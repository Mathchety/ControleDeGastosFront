import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Input com ícone
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {string} placeholder - Placeholder do input
 * @param {string} value - Valor do input
 * @param {function} onChangeText - Função de mudança
 * @param {boolean} secureTextEntry - Input de senha
 * @param {string} keyboardType - Tipo de teclado
 * @param {boolean} showToggle - Mostrar botão de toggle senha
 * @param {function} onToggle - Função do toggle
 * @param {object} style - Estilos adicionais
 * @param {string} error - Mensagem de erro
 */
export const Input = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    keyboardType = 'default',
    showToggle = false,
    onToggle,
    style,
    error
}) => (
    <View>
        <View style={[styles.inputContainer, error && styles.inputError, style]}>
            {icon && (
                <Ionicons 
                    name={icon} 
                    size={20} 
                    color={error ? '#ef4444' : '#666'} 
                    style={styles.inputIcon} 
                />
            )}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={error ? '#fca5a5' : '#999'}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize="none"
            />
            {showToggle && (
                <TouchableOpacity onPress={onToggle}>
                    <Ionicons 
                        name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#666" 
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 10,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 15,
    },
});
