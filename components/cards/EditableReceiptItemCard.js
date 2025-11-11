import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';

/**
 * Card de item de nota fiscal com design igual ao CategoryDetailsScreen
 * @param {Object} item - Item da nota fiscal
 * @param {Number} itemIndex - Índice do item na lista
 * @param {Function} onUpdate - Callback quando item é atualizado
 * @param {Function} onDelete - Callback quando item é deletado
 * @param {Boolean} readOnly - Se true, desabilita edição
 */
export default function EditableReceiptItemCard({ item, itemIndex, onUpdate, onDelete, readOnly }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    
    console.log('[EditableCard] 🔄 Renderizando item:', {
        itemIndex,
        hasOnUpdate: !!onUpdate,
        hasOnDelete: !!onDelete,
        readOnly,
        productName: item.product?.name || item.description
    });
    
    // Extrai dados do item
    const productName = item.product?.name || item.description || '';
    const categoryName = item.category?.name || item.categoryName || '';
    const unity = item.product?.unity || item.unit || 'UN';
    const itemTotal = parseFloat(item.total || 0);
    const quantity = parseFloat(item.quantity || 1);
    const unitPrice = quantity > 0 ? itemTotal / quantity : 0;
    
    const [formQuantity, setFormQuantity] = useState(quantity.toString());
    const [formTotal, setFormTotal] = useState(itemTotal.toFixed(2));
    
    // Calcula preço unitário automaticamente
    const calculatedUnitPrice = parseFloat(formQuantity) > 0 
        ? parseFloat(formTotal) / parseFloat(formQuantity)
        : 0;

    const handleEditItem = () => {
        setFormQuantity(quantity.toString());
        setFormTotal(itemTotal.toFixed(2));
        setModalVisible(true);
    };

    const handleSave = async () => {
        console.log('[EditableCard] 💾 Salvando item:', {
            itemIndex,
            quantity: formQuantity,
            total: formTotal,
            calculatedUnitPrice
        });
        
        if (!onUpdate) {
            console.log('[EditableCard] ❌ onUpdate não está definido!');
            return;
        }
        
        setSaving(true);
        
        const updatedItem = {
            ...item,
            quantity: parseFloat(formQuantity),
            total: parseFloat(formTotal),
            unitPrice: calculatedUnitPrice,
        };
        
        console.log('[EditableCard] 📤 Chamando onUpdate com:', updatedItem);
        onUpdate(updatedItem, itemIndex);
        setSaving(false);
        setModalVisible(false);
    };

    if (item.deleted) {
        return null; // Não mostra itens deletados
    }

    return (
        <>
            <View style={styles.itemCard}>
                {/* Header com badge e botão de editar */}
                <View style={styles.itemHeader}>
                    <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>#{itemIndex + 1}</Text>
                    </View>
                    <Text style={styles.itemName}>{productName}</Text>
                    {!readOnly && (
                        <TouchableOpacity
                            style={styles.editItemButton}
                            onPress={handleEditItem}
                        >
                            <Ionicons name="create-outline" size={20} color="#667eea" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Detalhes do item */}
                <View style={styles.itemDetails}>
                    <View style={styles.itemDetailRow}>
                        <Ionicons name="cube-outline" size={16} color="#666" />
                        <Text style={styles.itemDetailText}>
                            Quantidade: {quantity} {unity}
                        </Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                        <Ionicons name="pricetag-outline" size={16} color="#666" />
                        <Text style={styles.itemDetailText}>
                            Preço Unitário: R$ {unitPrice.toFixed(2)}
                        </Text>
                    </View>
                    {categoryName && (
                        <View style={styles.itemDetailRow}>
                            <Ionicons name="folder-outline" size={16} color="#666" />
                            <Text style={styles.itemDetailText}>{categoryName}</Text>
                        </View>
                    )}
                </View>

                {/* Footer com total */}
                <View style={styles.itemFooter}>
                    <Text style={styles.itemTotalLabel}>Total</Text>
                    <Text style={styles.itemTotalValue}>
                        R$ {itemTotal.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Modal de Edição */}
            {!readOnly && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Editar Item</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Nome do item (somente leitura) */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Produto</Text>
                                <View style={styles.readOnlyField}>
                                    <Text style={styles.readOnlyText}>{productName}</Text>
                                </View>
                            </View>

                            {/* Campo de quantidade - adapta label baseado no tipo */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {unity?.toUpperCase().includes('KG') 
                                        ? 'Peso (kg)' 
                                        : unity?.toUpperCase().includes('ML') || unity?.toUpperCase().includes('L')
                                        ? 'Volume (ml)' 
                                        : 'Quantidade'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={formQuantity}
                                    onChangeText={setFormQuantity}
                                    keyboardType="decimal-pad"
                                    placeholder="0"
                                />
                            </View>

                            {/* Total */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Total</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formTotal}
                                    onChangeText={setFormTotal}
                                    keyboardType="decimal-pad"
                                    placeholder="0.00"
                                />
                            </View>

                            {/* Preço unitário calculado - adapta label baseado no tipo */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {unity?.toUpperCase().includes('KG') 
                                        ? 'Preço por kg (calculado)' 
                                        : unity?.toUpperCase().includes('ML') || unity?.toUpperCase().includes('L')
                                        ? 'Preço por ml (calculado)' 
                                        : 'Preço unitário (calculado)'}
                                </Text>
                                <View style={styles.calculatedField}>
                                    <Text style={styles.calculatedValue}>
                                        R$ {calculatedUnitPrice.toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            {/* Botões */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.deleteModalButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        onDelete(itemIndex);
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Salvar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    itemBadge: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(12),
        backgroundColor: '#667eea',
        marginRight: moderateScale(10),
    },
    itemBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#fff',
    },
    itemName: {
        flex: 1,
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    editItemButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#f0f4ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: moderateScale(8),
    },
    itemDetails: {
        marginBottom: moderateScale(12),
    },
    itemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(6),
    },
    itemDetailText: {
        fontSize: moderateScale(14),
        color: '#666',
        marginLeft: moderateScale(8),
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    itemTotalLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#666',
    },
    itemTotalValue: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#667eea',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        padding: moderateScale(20),
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(20),
    },
    modalTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#333',
    },
    formGroup: {
        marginBottom: moderateScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(8),
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        fontSize: moderateScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    readOnlyField: {
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    readOnlyText: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    calculatedField: {
        backgroundColor: '#f0f4ff',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        borderWidth: 1,
        borderColor: '#d0d9ff',
    },
    calculatedValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#667eea',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: moderateScale(10),
        marginTop: moderateScale(10),
    },
    modalButton: {
        flex: 1,
        height: moderateScale(50),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteModalButton: {
        flex: 0,
        width: moderateScale(50),
        backgroundColor: '#fff0f0',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#667eea',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
});
