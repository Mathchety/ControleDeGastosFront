import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../inputs';
import { PrimaryButton, SecondaryButton } from '../buttons';

/**
 * Card de item de nota fiscal editável com expansão
 * @param {Object} item - Item da nota fiscal
 * @param {Number} itemIndex - Índice do item na lista
 * @param {Function} onUpdate - Callback quando item é atualizado
 * @param {Function} onDelete - Callback quando item é deletado
 */
export default function EditableReceiptItemCard({ item, itemIndex, onUpdate, onDelete, readOnly }) {
    const [expanded, setExpanded] = useState(false);
    
    // Debug: Log do item recebido
    console.log(`[EditableCard] Item ${itemIndex}:`, {
        hasProduct: !!item.product,
        productName: item.product?.name,
        hasCategory: !!item.category,
        categoryName: item.category?.name,
        description: item.description,
        rawItem: JSON.stringify(item).substring(0, 200)
    });
    
    // Extrai o nome do produto e categoria da nova estrutura
    const productName = item.product?.name || item.description || '';
    const categoryName = item.category?.name || item.categoryName || '';
    const unity = item.product?.unity || item.unit || 'UN';
    
    console.log(`[EditableCard] Dados processados:`, {
        productName,
        categoryName,
        unity
    });
    
    const [editedItem, setEditedItem] = useState({
        description: productName,
        quantity: item.quantity?.toString() || '1',
        unitPrice: item.unitPrice?.toString() || '0',
        unit: unity,
        categoryName: categoryName,
    });

    const isKg = editedItem.unit?.toUpperCase() === 'KG';
    const calculatedTotal = parseFloat(editedItem.quantity || 0) * parseFloat(editedItem.unitPrice || 0);

    const handleSave = () => {
        const updatedItem = {
            ...item,
            description: editedItem.description,
            quantity: parseFloat(editedItem.quantity),
            unitPrice: parseFloat(editedItem.unitPrice),
            unit: editedItem.unit,
            total: calculatedTotal,
        };
        
        console.log('[EditableCard] Salvando item:', {
            index: itemIndex,
            description: editedItem.description,
            quantity: editedItem.quantity,
            unitPrice: editedItem.unitPrice,
            calculatedTotal
        });
        
        onUpdate(updatedItem, itemIndex);
        setExpanded(false);
    };

    const handleCancel = () => {
        setEditedItem({
            description: productName,
            quantity: item.quantity?.toString() || '1',
            unitPrice: item.unitPrice?.toString() || '0',
            unit: unity,
            categoryName: categoryName,
        });
        setExpanded(false);
    };

    return (
        <View style={[styles.container, item.deleted && styles.deletedContainer]}>
            {/* Header do item (sempre visível) */}
            <TouchableOpacity 
                style={styles.header}
                onPress={() => !readOnly && setExpanded(!expanded)}
                activeOpacity={readOnly ? 1 : 0.7}
                disabled={readOnly}
            >
                <View style={styles.headerLeft}>
                    <Text 
                        style={[styles.description, item.deleted && styles.deletedText]}
                        numberOfLines={2}
                    >
                        {productName}
                    </Text>
                    {categoryName && (
                        <Text style={styles.categoryBadge}>
                            {categoryName}
                        </Text>
                    )}
                    <Text style={styles.subtitle}>
                        {item.quantity} {unity} × R$ {parseFloat(item.unitPrice || 0).toFixed(2)}
                        {isKg && '/kg'}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={[styles.totalText, item.deleted && styles.deletedText]}>
                        R$ {parseFloat(item.total || 0).toFixed(2)}
                    </Text>
                    {!readOnly && (
                        <Ionicons 
                            name={expanded ? "chevron-up" : "chevron-down"} 
                            size={18} 
                            color="#667eea" 
                        />
                    )}
                </View>
            </TouchableOpacity>

            {item.deleted && (
                <View style={styles.deletedBadge}>
                    <Text style={styles.deletedBadgeText}>DELETADO</Text>
                </View>
            )}

            {/* Formulário de edição (expansível) */}
            {expanded && !item.deleted && (
                <View style={styles.editForm}>
                    {/* Descrição */}
                    <Input
                        icon="pricetag-outline"
                        placeholder="Nome do produto"
                        value={editedItem.description}
                        onChangeText={(text) => setEditedItem({ ...editedItem, description: text })}
                    />

                    {/* Quantidade e Unidade */}
                    <View style={styles.row}>
                        <View style={styles.inputWrapper}>
                            <Input
                                icon="cube-outline"
                                placeholder="Qtd"
                                value={editedItem.quantity}
                                onChangeText={(text) => setEditedItem({ ...editedItem, quantity: text })}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Input
                                placeholder="UN"
                                value={editedItem.unit}
                                onChangeText={(text) => setEditedItem({ ...editedItem, unit: text.toUpperCase() })}
                                maxLength={3}
                            />
                        </View>
                    </View>

                    {/* Preço unitário */}
                    <Input
                        icon="cash-outline"
                        placeholder={isKg ? "Preço por kg" : "Preço unitário"}
                        value={editedItem.unitPrice}
                        onChangeText={(text) => setEditedItem({ ...editedItem, unitPrice: text })}
                        keyboardType="decimal-pad"
                    />

                    {/* Total calculado */}
                    <View style={styles.calculatedTotal}>
                        <Text style={styles.calculatedLabel}>Total calculado:</Text>
                        <Text style={styles.calculatedValue}>
                            R$ {calculatedTotal.toFixed(2)}
                        </Text>
                    </View>

                    {/* Botões de ação */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => onDelete(itemIndex)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark" size={14} color="#fff" />
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    deletedContainer: {
        opacity: 0.6,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    description: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
        lineHeight: 18,
    },
    categoryBadge: {
        fontSize: 11,
        color: '#667eea',
        backgroundColor: '#f0f0ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 4,
        overflow: 'hidden',
    },
    deletedText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    totalText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#667eea',
    },
    deletedBadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginBottom: 10,
    },
    deletedBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    editForm: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 12,
        paddingTop: 15,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
    },
    calculatedTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        marginTop: 5,
    },
    calculatedLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    calculatedValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#667eea',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    deleteButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#ef4444',
    },
    cancelButton: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        gap: 4,
        backgroundColor: '#10b981',
    },
    saveButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
});
