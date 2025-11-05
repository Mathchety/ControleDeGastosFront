import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackButton } from '../buttons';

/**
 * Header da tela de preview com botão voltar
 * @param {function} onBack - Função ao pressionar voltar
 * @param {string} title - Título do header
 */
export const PreviewHeader = ({ onBack, title = 'Preview da Nota' }) => (
    <View style={styles.header}>
        <BackButton onPress={onBack} color="#fff" />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'transparent',
        borderRadius: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        
    },
});
