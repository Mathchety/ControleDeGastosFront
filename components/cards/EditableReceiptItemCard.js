import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../inputs';
import { PrimaryButton, SecondaryButton } from '../buttons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

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
                            size={theme.iconSizes.md} 
                            color={theme.colors.primary} 
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
                            <Ionicons name="trash-outline" size={theme.iconSizes.sm} color="#fff" />
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
                            <Ionicons name="checkmark" size={theme.iconSizes.sm} color="#fff" />
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
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.small,
    },
    deletedContainer: {
        opacity: 0.6,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    headerLeft: {
        flex: 1,
        marginRight: theme.spacing.xs,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    description: {
        fontSize: theme.fonts.body,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: moderateScale(3),
        lineHeight: fontScale(18),
    },
    categoryBadge: {
        fontSize: theme.fonts.caption,
        color: theme.colors.primary,
        backgroundColor: '#f0f0ff',
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: moderateScale(2),
        borderRadius: theme.radius.sm,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.xs,
        overflow: 'hidden',
    },
    deletedText: {
        textDecorationLine: 'line-through',
        color: theme.colors.textLight,
    },
    subtitle: {
        fontSize: theme.fonts.caption,
        color: theme.colors.textSecondary,
    },
    totalText: {
        fontSize: theme.fonts.body,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    deletedBadge: {
        backgroundColor: theme.colors.danger,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.md,
        alignSelf: 'flex-start',
        marginLeft: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    deletedBadgeText: {
        color: '#fff',
        fontSize: theme.fonts.caption,
        fontWeight: '700',
    },
    editForm: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: theme.spacing.md,
        paddingTop: theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    inputWrapper: {
        flex: 1,
    },
    calculatedTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
        marginBottom: theme.spacing.md,
        marginTop: theme.spacing.xs,
    },
    calculatedLabel: {
        fontSize: theme.fonts.caption,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    calculatedValue: {
        fontSize: fontScale(16),
        fontWeight: '700',
        color: theme.colors.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    deleteButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.danger,
    },
    cancelButton: {
        flex: 1,
        height: moderateScale(40),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.sm,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        fontSize: fontScale(13),
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        height: moderateScale(40),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.sm,
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.success,
    },
    saveButtonText: {
        fontSize: fontScale(13),
        fontWeight: '600',
        color: '#fff',
    },
});
