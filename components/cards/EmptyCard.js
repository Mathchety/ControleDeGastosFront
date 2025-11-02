import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Card vazio (placeholder)
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {string} title - Título da mensagem
 * @param {string} message - Mensagem explicativa
 * @param {string} action - Texto do botão de ação
 * @param {function} onAction - Função ao pressionar o botão
 */
export const EmptyCard = ({ icon, title, message, action, onAction }) => (
    <View style={styles.emptyCard}>
        <Ionicons name={icon} size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && onAction && (
            <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
                <Text style={styles.emptyActionText}>{action}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginVertical: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyAction: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#667eea',
        borderRadius: 12,
    },
    emptyActionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
