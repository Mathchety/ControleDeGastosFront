import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Card de resumo da nota fiscal com informações da loja e totais
 * @param {string} storeName - Nome da loja
 * @param {number} subtotal - Subtotal da nota
 * @param {number} discount - Desconto aplicado
 * @param {number} total - Total final
 */
export const ReceiptSummaryCard = ({ storeName, subtotal, discount, total }) => (
    <View style={styles.summaryCard}>
        <View style={styles.storeHeader}>
            <Ionicons name="storefront" size={32} color="#667eea" />
            <Text style={styles.storeName}>{storeName || 'Loja'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>R$ {parseFloat(subtotal || 0).toFixed(2)}</Text>
        </View>
        
        {discount > 0 && (
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto:</Text>
                <Text style={[styles.totalValue, styles.discountValue]}>
                    - R$ {parseFloat(discount || 0).toFixed(2)}
                </Text>
            </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Total:</Text>
            <Text style={styles.totalValueBold}>R$ {parseFloat(total || 0).toFixed(2)}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    storeHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    storeName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    discountValue: {
        color: '#10b981',
    },
    totalLabelBold: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    totalValueBold: {
        fontSize: 24,
        fontWeight: '700',
        color: '#667eea',
    },
});
