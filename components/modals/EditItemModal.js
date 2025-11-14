import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { ErrorMessage } from '../common/ErrorMessage';

/**
 * 🎨 Modal Bonito de Edição de Item
 * 
 * Componente extraído do CategoryDetailsScreen para ser reutilizado
 * em todas as telas que precisam editar itens (Histórico, Categorias, etc)
 * 
 * @param {boolean} visible - Controla visibilidade do modal
 * @param {object} item - Item a ser editado { id, name, quantity, total, categoryId }
 * @param {array} categories - Lista de categorias disponíveis
 * @param {function} onSave - Callback ao salvar (item) => Promise
 * @param {function} onClose - Callback ao fechar modal
 */
export default function EditItemModal({ 
    visible, 
    item, 
    categories = [], 
    disableCategory = false,
    hideCategory = false,
    onSave, 
    onClose 
}) {
    const [errorState, setErrorState] = useState({ visible: false, title: '', message: '' });
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemTotal, setItemTotal] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [saving, setSaving] = useState(false);

    // ✨ Extrai nome do produto com fallback
    const productName = item?.product?.name || item?.name || item?.description || 'Sem nome';

    // ✨ Atualiza campos quando item muda
    useEffect(() => {
        if (item) {
            setItemQuantity(String(item.quantity || ''));
            setItemTotal(String(item.total || ''));
            setSelectedCategoryId(item.categoryId || item.category?.id);
        }
    }, [item]);

    const handleSave = async () => {
        try {
            // Validações
            if (!itemQuantity || parseFloat(itemQuantity) <= 0) {
                setErrorState({
                    visible: true,
                    title: 'Campo Obrigatório',
                    message: 'Quantidade deve ser maior que zero'
                });
                return;
            }
            if (!itemTotal || parseFloat(itemTotal) <= 0) {
                setErrorState({
                    visible: true,
                    title: 'Campo Obrigatório',
                    message: 'Total deve ser maior que zero'
                });
                return;
            }

            setSaving(true);

            const quantity = parseFloat(itemQuantity);
            const total = parseFloat(itemTotal);
            const unitPrice = total / quantity;

            const updateData = {
                id: item.id,
                name: productName,
                quantity: quantity,
                total: total,
                unitPrice: unitPrice,
                categoryId: selectedCategoryId
            };

            await onSave(updateData);
            
            // Fecha modal após salvar
            handleClose();
        } catch (error) {
            setErrorState({
                visible: true,
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar o item'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        // Reseta estados
        setItemQuantity('');
        setItemTotal('');
        setSelectedCategoryId(null);
        setSaving(false);
        onClose();
    };

    if (!item) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Editar Item</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Nome do Produto (readonly) */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Produto</Text>
                            <View style={styles.readOnlyField}>
                                <Text style={styles.readOnlyText}>{productName}</Text>
                            </View>
                        </View>

                        {/* Quantidade */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Quantidade *</Text>
                            <TextInput
                                style={styles.input}
                                value={itemQuantity}
                                onChangeText={setItemQuantity}
                                placeholder="Ex: 2"
                                keyboardType="decimal-pad"
                                maxLength={10}
                            />
                        </View>

                        {/* Total */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Total (R$) *</Text>
                            <TextInput
                                style={styles.input}
                                value={itemTotal}
                                onChangeText={setItemTotal}
                                placeholder="Ex: 10.50"
                                keyboardType="decimal-pad"
                                maxLength={10}
                            />
                        </View>

                        {/* Preço Unitário Calculado */}
                        {itemQuantity && itemTotal && parseFloat(itemQuantity) > 0 && (
                            <View style={styles.calculatedField}>
                                <Text style={styles.calculatedLabel}>Preço Unitário:</Text>
                                <Text style={styles.calculatedValue}>
                                    R$ {(parseFloat(itemTotal) / parseFloat(itemQuantity)).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        {/* Categoria */}
                        {!hideCategory && categories && categories.length > 0 && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Categoria</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryChip,
                                                selectedCategoryId === cat.id && styles.categoryChipSelected,
                                                disableCategory && { opacity: 0.5 }
                                            ]}
                                            onPress={() => !disableCategory && setSelectedCategoryId(cat.id)}
                                            disabled={disableCategory}
                                        >
                                            <View style={[styles.categoryChipColor, { backgroundColor: cat.color }]} />
                                            <Text style={[
                                                styles.categoryChipText,
                                                selectedCategoryId === cat.id && styles.categoryChipTextSelected
                                            ]}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>

                    {/* Botões */}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={saving}
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

            {/* Modal de Erro/Sucesso */}
            <ErrorMessage
                visible={errorState.visible}
                title={errorState.title}
                message={errorState.message}
                type={errorState.type}
                onClose={() => setErrorState({ ...errorState, visible: false })}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
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
        maxHeight: '90%',
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
        backgroundColor: '#f0f0f0',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        borderRadius: moderateScale(12),
        padding: moderateScale(15),
        marginBottom: moderateScale(20),
    },
    calculatedLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#667eea',
    },
    calculatedValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#667eea',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(20),
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(15),
        marginRight: moderateScale(10),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryChipSelected: {
        backgroundColor: '#f0f4ff',
        borderColor: '#667eea',
    },
    categoryChipColor: {
        width: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        marginRight: moderateScale(8),
    },
    categoryChipText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#666',
    },
    categoryChipTextSelected: {
        color: '#667eea',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginTop: moderateScale(20),
    },
    modalButton: {
        flex: 1,
        paddingVertical: moderateScale(15),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
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
