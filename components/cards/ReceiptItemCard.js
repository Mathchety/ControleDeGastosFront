import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Formata a descrição do item baseado no tipo de venda (por quilo ou unidade)
 * @param {object} item - Item da nota fiscal
 * @returns {string} Descrição formatada
 */
const formatItemDescription = (item) => {
    const quantity = parseFloat(item.quantity || 0);
    const unitPrice = parseFloat(item.unitPrice || 0);
    const total = parseFloat(item.total || 0);
    
    // Detecta se é venda por peso (kg) - normalmente quando a quantidade tem decimais
    const isPricePerKg = quantity % 1 !== 0 || item.unit === 'kg' || item.unit === 'KG';
    
    if (isPricePerKg) {
        // Venda por quilo: "0.500 kg x R$ 10.00/kg"
        return `${quantity.toFixed(3)} kg × R$ ${unitPrice.toFixed(2)}/kg`;
    } else {
        // Venda por unidade: "2x R$ 10.00"
        return `${Math.floor(quantity)}x R$ ${unitPrice.toFixed(2)}`;
    }
};

/**
 * Card de item da nota fiscal
 * @param {object} item - Dados do item
 * @param {boolean} deleted - Se o item foi deletado
 */
export const ReceiptItemCard = ({ item, deleted = false }) => (
    <View 
        style={[
            styles.itemCard,
            deleted && styles.itemCardDeleted
        ]}
    >
        <Text 
            style={[
                styles.itemDescription,
                deleted && styles.itemTextDeleted
            ]}
            numberOfLines={2}
        >
            {item.description}
        </Text>
        
        <View style={styles.itemFooter}>
            <Text style={[styles.itemQuantity, deleted && styles.itemTextDeleted]}>
                {formatItemDescription(item)}
            </Text>
            <Text style={[styles.itemTotal, deleted && styles.itemTextDeleted]}>
                R$ {parseFloat(item.total || 0).toFixed(2)}
            </Text>
        </View>
        
        {deleted && (
            <View style={styles.deletedBadge}>
                <Ionicons name="trash" size={12} color="#fff" />
                <Text style={styles.deletedText}>Deletado</Text>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    itemCardDeleted: {
        opacity: 0.5,
        backgroundColor: '#f3f4f6',
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    itemTextDeleted: {
        textDecorationLine: 'line-through',
        color: '#9ca3af',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#667eea',
    },
    deletedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    deletedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});
