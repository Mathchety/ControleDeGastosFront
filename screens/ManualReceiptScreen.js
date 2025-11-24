import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    Dimensions,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../contexts/DataContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateToBrazil, parseYYYYMMDDToDate } from '../utils/dateUtils';
import { moderateScale, fontScale } from '../utils/responsive';
import { theme } from '../utils/theme';
import { getValidIcon } from '../utils/iconHelper';
import { GradientHeader } from '../components/common';

export default function ManualReceiptScreen({ navigation }) {
    const { categories, fetchCategories, createManualReceipt, isConnected } = useData();
    const [storeName, setStoreName] = useState('');
    const [date, setDate] = useState(formatDateToBrazil(new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(parseYYYYMMDDToDate(formatDateToBrazil(new Date())));
    const [items, setItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Responsividade: detecta dispositivos pequenos (iOS/Android)
    const { width, height } = Dimensions.get('window');
    const isSmallDevice = width <= 360 || height <= 700;

    // Novo item sendo adicionado
    const [newItem, setNewItem] = useState({
        productName: '',
        quantity: '',
        total: '',
        categoryId: null,
        categoryName: '',
        unity: 'UN',
    });

    // Desconto da nota (no nível da nota, não por item)
    const [receiptDiscount, setReceiptDiscount] = useState('');

    // Normaliza entradas numéricas (vírgula -> ponto, remove caracteres não-numéricos)
    const normalizeNumberInput = (text) => {
        if (typeof text !== 'string') return '';
        return text.replace(',', '.').replace(/[^0-9.]/g, '');
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            await fetchCategories();
        } catch (error) {
        } finally {
            setLoadingCategories(false);
        }
    };

    const validateItem = () => {
        
        if (!newItem.productName.trim()) {
            Alert.alert('Atenção', 'Digite o nome do produto');
            return false;
        }
        if (!newItem.quantity || isNaN(parseFloat(newItem.quantity.toString().replace(',', '.'))) || parseFloat(newItem.quantity.toString().replace(',', '.')) <= 0) {
            Alert.alert('Atenção', 'Digite uma quantidade válida');
            return false;
        }
        if (!newItem.total || isNaN(parseFloat(newItem.total.toString().replace(',', '.'))) || parseFloat(newItem.total.toString().replace(',', '.')) <= 0) {
            Alert.alert('Atenção', 'Digite um total válido');
            return false;
        }
        if (!newItem.categoryId) {
            Alert.alert('Atenção', 'Selecione uma categoria');
            return false;
        }
        
        // Numeric limits
        const q = parseFloat(newItem.quantity.toString().replace(',', '.'));
        const t = parseFloat(newItem.total.toString().replace(',', '.'));

        if (q > 9999999) {
            Alert.alert('Atenção', 'Quantidade muito grande (máx: 9.999.999)');
            return false;
        }
        if (t > 9999999) {
            Alert.alert('Atenção', 'Valor muito grande (máx: R$ 9.999.999)');
            return false;
        }

        return true;
    };

    const handleAddItem = (closeModal = true) => {
        if (!validateItem()) return;
    const quantity = parseFloat(newItem.quantity.toString().replace(',', '.'));
    const total = parseFloat(newItem.total.toString().replace(',', '.'));
    const unitPrice = total / quantity;

        const item = {
            id: Date.now().toString(),
            productName: newItem.productName.trim(),
            quantity: quantity,
            total: total,
            categoryId: newItem.categoryId,
            categoryName: newItem.categoryName,
            unity: newItem.unity,
            unitPrice: unitPrice,
        };

        setItems([...items, item]);
        
        // Reseta o formulário completamente
        setNewItem({
            productName: '',
            quantity: '',
            total: '',
            categoryId: null,
            categoryName: '',
            unity: 'UN',
        });

        if (closeModal) {
            setModalVisible(false);
        }
    };

    const handleAddAndContinue = () => {
        handleAddItem(false);
    };

    const handleRemoveItem = (itemId) => {
        Alert.alert(
            'Confirmar exclusão',
            'Deseja remover este item?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => setItems(items.filter(item => item.id !== itemId)),
                },
            ]
        );
    };

    const handleSelectCategory = (category) => {
        setNewItem({
            ...newItem,
            categoryId: category.id,
            categoryName: category.name,
        });
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (parseFloat(item.total || 0)), 0);
    
    // Variáveis auxiliares para validação visual do desconto
    const currentSubtotal = calculateSubtotal();
    const currentDiscount = receiptDiscount ? parseFloat(receiptDiscount.toString().replace(',', '.')) : 0;
    const isDiscountInvalid = currentDiscount > currentSubtotal;

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = receiptDiscount ? parseFloat(receiptDiscount.toString().replace(',', '.')) : 0;
        // Garante que não fique negativo visualmente, embora a validação impeça salvar
        const total = subtotal - (isNaN(discount) ? 0 : discount);
        return total < 0 ? 0 : total;
    };

    const handleSave = async () => {
        if (!isConnected) {
            Alert.alert('Modo offline', 'Você está offline. Não é possível salvar notas no momento.');
            return;
        }
        if (!storeName.trim()) {
            Alert.alert('Atenção', 'Digite o nome do estabelecimento');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um item');
            return;
        }

        const subtotal = calculateSubtotal();
        const discount = receiptDiscount ? parseFloat(receiptDiscount.toString().replace(',', '.')) : 0;

        // Validação do Desconto > 100%
        if (discount > subtotal) {
            Alert.alert('Atenção', 'O desconto não pode ser maior que o valor total da nota (100%)');
            return;
        }

        
        // Validação de itens
        const invalidItems = items.filter(item => 
            !item.productName?.trim() || 
            !item.quantity || 
            isNaN(item.quantity) ||
            item.quantity <= 0 ||
            item.quantity > 9999999 || // Limite máximo de quantidade
            !item.total ||
            isNaN(item.total) ||
            item.total <= 0 ||
            item.total > 9999999 || // Limite máximo de valor (9.999.999)
            !item.categoryId
        );

        if (invalidItems.length > 0) {
            const problematicItems = invalidItems.map(item => ({
                nome: item.productName,
                quantidade: item.quantity,
                total: item.total,
                problema: !item.productName?.trim() ? 'Nome vazio' :
                         isNaN(item.quantity) || item.quantity <= 0 ? 'Quantidade inválida' :
                         item.quantity > 9999999 ? 'Quantidade muito grande (máx: 9.999.999)' :
                         isNaN(item.total) || item.total <= 0 ? 'Total inválido' :
                         item.total > 9999999 ? 'Valor muito grande (máx: R$ 9.999.999)' :
                         !item.categoryId ? 'Sem categoria' : 'Desconhecido'
            }));

            Alert.alert(
                'Atenção', 
                'Alguns itens estão inválidos:\n\n' + 
                problematicItems.map(i => `• ${i.nome}: ${i.problema}`).join('\n')
            );
            return;
        }

        try {
            setSaving(true);
            const total = subtotal - (isNaN(discount) ? 0 : discount);

            // Formato correto da API POST /receipt
            const receiptData = {
                storeName: storeName.trim(),
                date: date,
                currency: 'BRL',
                subtotal: subtotal,
                discount: isNaN(discount) ? 0 : discount,
                total: total,
                notes: '',
                items: items.map(item => {
                    const mappedItem = {
                        productName: item.productName.trim(),
                        productUnit: item.unity || 'UN',
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unitPrice),
                        total: parseFloat(item.total),
                        categoryId: item.categoryId,
                    };
                    return mappedItem;
                }),
            };

            const result = await createManualReceipt(receiptData);
            
            Alert.alert(
                'Sucesso',
                'Nota fiscal criada com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Main', { screen: 'Home' }),
                    },
                ]
            );
        } catch (error) {
            
            // Não mostra alert aqui pois o DataContext já mostra
            // Alert.alert('Erro', 'Não foi possível salvar a nota fiscal');
        } finally {
            setSaving(false);
        }
    };

    const renderItemCard = (item) => {
        const quantity = item.unity?.toUpperCase().includes('KG') 
            ? `${item.quantity} kg`
            : item.unity?.toUpperCase().includes('ML') || item.unity?.toUpperCase().includes('L')
            ? `${item.quantity} ml`
            : `${item.quantity} un`;

        return (
            <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        style={styles.removeButton}
                    >
                        <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                </View>
                <View style={styles.itemDetails}>
                    <View style={styles.itemDetailRow}>
                        <Ionicons name="cube-outline" size={16} color="#666" />
                        <Text style={styles.itemDetailText}>{quantity}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                        <Ionicons name="folder-outline" size={16} color="#666" />
                        <Text style={styles.itemDetailText}>{item.categoryName}</Text>
                    </View>
                </View>
                <View style={styles.itemFooter}>
                    <Text style={styles.itemTotalLabel}>Total</Text>
                    <Text style={styles.itemTotalValue}>R$ {item.total.toFixed(2)}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header */}
            <GradientHeader 
                icon="receipt-outline" 
                title="Nova Nota Manual"
                subtitle="Adicione itens manualmente"
                leftButton={
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                }
            />

            {/* 🚀 MELHORIA DO SCROLL VIEW: Envolvemos em KeyboardAvoidingView */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
            >
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: moderateScale(100) }}
                >
                    {/* Informações da Nota */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informações da Nota</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Estabelecimento <Text style={styles.requiredAsterisk}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={storeName}
                                onChangeText={setStoreName}
                                placeholder="Nome do estabelecimento"
                                placeholderTextColor="#999"
                                maxLength={80}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Data</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => {
                                    setTempDate(parseYYYYMMDDToDate(date));
                                    setShowDatePicker(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: date ? '#333' : '#999' }}>{date}</Text>
                                    <Ionicons name="calendar-outline" size={20} color="#666" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lista de Itens */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Itens ({items.length})</Text>
                            <TouchableOpacity
                                style={styles.addItemButton}
                                onPress={() => setModalVisible(true)}
                            >
                                <Ionicons name="add-circle" size={28} color="#667eea" />
                            </TouchableOpacity>
                        </View>

                        {items.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>Nenhum item adicionado</Text>
                                <Text style={styles.emptySubtext}>Toque no + para adicionar</Text>
                            </View>
                        ) : (
                            items.map(renderItemCard)
                        )}
                    </View>

                    {/* Total / Subtotal / Desconto da Nota */}
                    {items.length > 0 && (
                        <View style={[styles.totalSection, isSmallDevice && styles.totalSectionSmall]}>
                            <View style={[styles.totalRow, isSmallDevice && styles.totalRowSmall]}>
                                <Text style={[styles.totalLabel, isSmallDevice && styles.totalLabelSmall]}>Subtotal</Text>
                                <Text style={[styles.totalValue, isSmallDevice && styles.totalValueSmall]}>R$ {calculateSubtotal().toFixed(2)}</Text>
                            </View>

                            <View style={[styles.discountRow, isSmallDevice && styles.discountRowSmall]}>
                                <Text style={[styles.totalLabel, isSmallDevice && styles.totalLabelSmall]}>Desconto da Nota (R$)</Text>
                                <TextInput
                                    style={[
                                        styles.discountInput, 
                                        isSmallDevice && styles.discountInputSmall,
                                        isDiscountInvalid && styles.inputError // Estilo de erro
                                    ]}
                                    value={receiptDiscount}
                                    onChangeText={(text) => setReceiptDiscount(normalizeNumberInput(text))}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    maxLength={7}
                                />
                            </View>

                            {/* Aviso visual se o desconto for maior que o subtotal */}
                            {isDiscountInvalid && (
                                <Text style={styles.discountWarningText}>
                                    ⚠️ Desconto não pode ser maior que 100% do valor
                                </Text>
                            )}

                            <View style={[styles.totalRow, isSmallDevice && styles.totalRowSmall]}> 
                                <Text style={[styles.totalLabel, isSmallDevice && styles.totalLabelSmall]}>Total da Nota</Text>
                                <Text style={[styles.totalValue, styles.totalValueBold, isSmallDevice && styles.totalValueSmall]}>R$ {calculateTotal().toFixed(2)}</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Botão Salvar */}
                {items.length > 0 && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton, 
                                (saving || !isConnected || isDiscountInvalid) && styles.saveButtonDisabled
                            ]}
                            onPress={handleSave}
                            disabled={saving || !isConnected || isDiscountInvalid}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.saveButtonGradient}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        <Text style={styles.saveButtonText}>Salvar Nota</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* DateTimePicker nativo para selecionar DATA única */}
                {showDatePicker && (
                    <>
                        <DateTimePicker
                            value={tempDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(event, selectedDate) => {
                                // selectedDate pode ser undefined se dismiss
                                if (selectedDate) {
                                    setTempDate(selectedDate);
                                }
                                // No Android, o picker nativo mostra botões OK/Cancel; ainda assim
                                // respeitamos o fluxo de confirmação manual abaixo.
                                if (Platform.OS === 'android') {
                                    // Quando Android enviar selection, atualizamos e fechamos automaticamente
                                    if (event?.type === 'set' && selectedDate) {
                                        setDate(formatDateToBrazil(selectedDate));
                                    }
                                    setShowDatePicker(false);
                                }
                            }}
                            maximumDate={new Date()}
                            locale="pt-BR"
                        />

                        {/* Ações de confirmar/cancelar para iOS inline e para consistência */}
                        <View style={styles.datePickerActions}>
                            <TouchableOpacity
                                style={[styles.datePickerButton, styles.datePickerCancel]}
                                onPress={() => {
                                    setShowDatePicker(false);
                                }}
                            >
                                <Text style={styles.datePickerButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.datePickerButton, styles.datePickerConfirm]}
                                onPress={() => {
                                    setDate(formatDateToBrazil(tempDate || new Date()));
                                    setShowDatePicker(false);
                                }}
                            >
                                <Text style={[styles.datePickerButtonText, { color: '#fff' }]}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>

            {/* Modal de Adicionar Item */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Adicionar Item</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView 
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Nome do Produto */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Produto <Text style={styles.requiredAsterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newItem.productName}
                                        onChangeText={(text) => setNewItem({ ...newItem, productName: text })}
                                        placeholder="Nome do produto"
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                    />
                                </View>

                                {/* Tipo de Unidade */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Tipo</Text>
                                    <View style={styles.unityButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.unityButton,
                                                newItem.unity === 'UN' && styles.unityButtonActive,
                                            ]}
                                            onPress={() => setNewItem({ ...newItem, unity: 'UN' })}
                                        >
                                            <Text
                                                style={[
                                                    styles.unityButtonText,
                                                    newItem.unity === 'UN' && styles.unityButtonTextActive,
                                                ]}
                                            >
                                                Unidade
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.unityButton,
                                                newItem.unity === 'KG' && styles.unityButtonActive,
                                            ]}
                                            onPress={() => setNewItem({ ...newItem, unity: 'KG' })}
                                        >
                                            <Text
                                                style={[
                                                    styles.unityButtonText,
                                                    newItem.unity === 'KG' && styles.unityButtonTextActive,
                                                ]}
                                            >
                                                Peso (kg)
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.unityButton,
                                                newItem.unity === 'ML' && styles.unityButtonActive,
                                            ]}
                                            onPress={() => setNewItem({ ...newItem, unity: 'ML' })}
                                        >
                                            <Text
                                                style={[
                                                    styles.unityButtonText,
                                                    newItem.unity === 'ML' && styles.unityButtonTextActive,
                                                ]}
                                            >
                                                Volume (ml)
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Quantidade */}
                                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>
                        {newItem.unity === 'KG'
                            ? 'Peso'
                            : newItem.unity === 'ML'
                            ? 'Volume'
                            : 'Quantidade'} <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newItem.quantity}
                                        onChangeText={(text) => setNewItem({ ...newItem, quantity: text.replace(',', '.').replace(/[^0-9.]/g, '') })}
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                        maxLength={7}
                                    />
                                    {newItem.quantity && parseFloat(newItem.quantity.toString().replace(',', '.')) > 9999999 && (
                                        <Text style={styles.warningText}>⚠️ Quantidade muito grande (máx: 9.999.999)</Text>
                                    )}
                                </View>

                                {/* Total */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Total (R$) <Text style={styles.requiredAsterisk}>*</Text></Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newItem.total}
                                        onChangeText={(text) => setNewItem({ ...newItem, total: text.replace(',', '.').replace(/[^0-9.]/g, '') })}
                                        placeholder="0.00"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                        maxLength={7}
                                    />
                                    {newItem.total && parseFloat(newItem.total.toString().replace(',', '.')) > 9999999 && (
                                        <Text style={styles.warningText}>⚠️ Valor muito grande (máx: R$ 9.999.999)</Text>
                                    )}
                                </View>

                                {/* Categoria */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Categoria <Text style={styles.requiredAsterisk}>*</Text></Text>
                                    {loadingCategories ? (
                                        <ActivityIndicator color="#667eea" style={styles.categoryLoader} />
                                    ) : (
                                        <View style={styles.categoriesGrid}>
                                            {categories.map((category) => {
                                                const iconName = getValidIcon(category.icon);
                                                const isSelected = newItem.categoryId === category.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={category.id}
                                                        style={[
                                                            styles.categoryCard,
                                                            isSelected && styles.categoryCardActive,
                                                        ]}
                                                        onPress={() => handleSelectCategory(category)}
                                                    >
                                                        <Ionicons
                                                            name={iconName}
                                                            size={24}
                                                            color={isSelected ? '#fff' : category.color}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.categoryCardText,
                                                                isSelected && styles.categoryCardTextActive,
                                                            ]}
                                                        >
                                                            {category.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            {/* Botões do Modal */}
                            <View style={styles.modalFooter}>
                                {/* Botão Adicionar e Continuar */}
                                <TouchableOpacity
                                    style={[
                                        styles.addContinueButton,
                                        (!newItem.productName.trim() || 
                                         !newItem.quantity || 
                                         !newItem.total || 
                                         !newItem.categoryId ||
                                         parseFloat((newItem.quantity || '0').toString().replace(',', '.')) > 9999999 ||
                                         parseFloat((newItem.total || '0').toString().replace(',', '.')) > 9999999) && styles.buttonDisabled
                                    ]}
                                    onPress={handleAddAndContinue}
                                    disabled={!newItem.productName.trim() || 
                                              !newItem.quantity || 
                                              !newItem.total || 
                                              !newItem.categoryId ||
                                              parseFloat((newItem.quantity || '0').toString().replace(',', '.')) > 9999999 ||
                                              parseFloat((newItem.total || '0').toString().replace(',', '.')) > 9999999}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.addContinueButtonText}>Adicionar Outro</Text>
                                </TouchableOpacity>

                                {/* Botões Cancelar e Concluir */}
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelModalButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalButton,
                                            styles.addModalButton,
                                            (!newItem.productName.trim() || 
                                             !newItem.quantity || 
                                             !newItem.total || 
                                             !newItem.categoryId ||
                                             parseFloat((newItem.quantity || '0').toString().replace(',', '.')) > 9999999 ||
                                             parseFloat((newItem.total || '0').toString().replace(',', '.')) > 9999999) && styles.buttonDisabled
                                        ]}
                                        onPress={() => handleAddItem(true)}
                                        disabled={!newItem.productName.trim() || 
                                                    !newItem.quantity || 
                                                    !newItem.total || 
                                                    !newItem.categoryId ||
                                                    parseFloat((newItem.quantity || '0').toString().replace(',', '.')) > 9999999 ||
                                                    parseFloat((newItem.total || '0').toString().replace(',', '.')) > 9999999}
                                    >
                                        <Text style={styles.addModalButtonText}>Concluir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: moderateScale(20),
    },
    section: {
        marginBottom: moderateScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: moderateScale(16),
    },
    sectionTitle: {
        fontSize: fontScale(18),
        fontWeight: '700',
        color: '#333',
    },
    inputGroup: {
        marginBottom: moderateScale(16),
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#666',
        marginBottom: moderateScale(8),
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        fontSize: fontScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    addItemButton: {
        padding: moderateScale(4),
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(40),
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#999',
        marginTop: moderateScale(12),
    },
    emptySubtext: {
        fontSize: fontScale(14),
        color: '#ccc',
        marginTop: moderateScale(4),
    },
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
        justifyContent: 'space-between',
        marginBottom: moderateScale(12),
    },
    itemName: {
        flex: 1,
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#333',
    },
    removeButton: {
        padding: moderateScale(4),
    },
    itemDetails: {
        flexDirection: 'row',
        gap: moderateScale(16),
        marginBottom: moderateScale(12),
    },
    itemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
    },
    itemDetailText: {
        fontSize: fontScale(14),
        color: '#666',
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    itemTotalLabel: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#666',
    },
    itemTotalValue: {
        fontSize: fontScale(18),
        fontWeight: '700',
        color: '#667eea',
    },
    totalSection: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: moderateScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalSectionSmall: {
        padding: moderateScale(12),
    },
    totalRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalRowSmall: {
        gap: moderateScale(6),
    },
    discountRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: moderateScale(10),
    },
    discountRowSmall: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    discountInput: {
        width: moderateScale(140),
        backgroundColor: '#fff',
        padding: moderateScale(10),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        textAlign: 'right',
    },
    inputError: {
        borderColor: '#ff6b6b',
        color: '#ff6b6b',
        borderWidth: 1,
    },
    discountInputSmall: {
        width: '100%',
        marginTop: moderateScale(6),
    },
    datePickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: moderateScale(8),
        paddingTop: moderateScale(8),
        paddingBottom: moderateScale(12),
        paddingHorizontal: moderateScale(4),
    },
    datePickerButton: {
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(10),
    },
    datePickerCancel: {
        backgroundColor: '#f0f0f0',
    },
    datePickerConfirm: {
        backgroundColor: '#667eea',
    },
    datePickerButtonText: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#333',
    },
    totalLabelSmall: {
        fontSize: fontScale(14),
    },
    totalValueSmall: {
        fontSize: fontScale(18),
    },
    totalValueBold: {
        fontWeight: '800',
    },
    totalLabel: {
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#666',
    },
    totalValue: {
        fontSize: fontScale(24),
        fontWeight: '700',
        color: '#667eea',
    },
    footer: {
        padding: moderateScale(20),
        paddingBottom: Platform.OS === 'ios' ? moderateScale(10) : moderateScale(20),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    saveButton: {
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(16),
        gap: moderateScale(8),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: fontScale(18),
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        paddingTop: moderateScale(20),
        paddingHorizontal: moderateScale(20),
        paddingBottom: Platform.OS === 'ios' ? moderateScale(30) : moderateScale(20),
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: moderateScale(20),
    },
    modalTitle: {
        fontSize: fontScale(20),
        fontWeight: '700',
        color: '#333',
    },
    formGroup: {
        marginBottom: moderateScale(20),
    },
    formLabel: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#666',
        marginBottom: moderateScale(8),
    },
    requiredAsterisk: {
        color: theme.colors.danger,
        fontWeight: '700',
        marginLeft: moderateScale(4),
    },
    formInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        fontSize: fontScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    warningText: {
        fontSize: fontScale(12),
        color: '#ff6b6b',
        marginTop: moderateScale(4),
        marginLeft: moderateScale(4),
    },
    discountWarningText: {
        fontSize: fontScale(12),
        color: '#ff6b6b',
        textAlign: 'right',
        width: '100%',
        marginTop: -5,
        marginBottom: 10,
        fontWeight: '600',
    },
    unityButtons: {
        flexDirection: 'row',
        gap: moderateScale(8),
    },
    unityButton: {
        flex: 1,
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(12),
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    unityButtonActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    unityButtonText: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#666',
    },
    unityButtonTextActive: {
        color: '#fff',
    },
    categoryLoader: {
        paddingVertical: moderateScale(20),
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(8),
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(8),
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(14),
        borderRadius: moderateScale(12),
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    categoryCardActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    categoryCardText: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#666',
    },
    categoryCardTextActive: {
        color: '#fff',
    },
    modalScrollContent: {
        paddingBottom: moderateScale(10),
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: moderateScale(16),
        marginTop: moderateScale(10),
    },
    addContinueButton: {
        backgroundColor: '#4ade80',
        borderRadius: moderateScale(12),
        paddingVertical: moderateScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addContinueButtonText: {
        fontSize: fontScale(16),
        fontWeight: '700',
        color: '#fff',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: moderateScale(12),
    },
    modalButton: {
        flex: 1,
        paddingVertical: moderateScale(14),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelModalButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelModalButtonText: {
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#666',
    },
    addModalButton: {
        backgroundColor: '#667eea',
    },
    addModalButtonText: {
        fontSize: fontScale(16),
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
});