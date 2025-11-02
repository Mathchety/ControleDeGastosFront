import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Item de informação do perfil
 * @param {string} icon - Nome do ícone (Ionicons)
 * @param {string} label - Label do item
 * @param {string} value - Valor do item
 * @param {function} onPress - Função ao pressionar
 */
export const ProfileInfoItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity 
        style={styles.infoItem}
        onPress={onPress}
    >
        <View style={styles.infoLeft}>
            <View style={styles.infoIconContainer}>
                <Ionicons name={icon} size={22} color="#667eea" />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <View style={styles.infoRight}>
            <Text style={styles.infoValue}>{value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 15,
        color: '#666',
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
});
