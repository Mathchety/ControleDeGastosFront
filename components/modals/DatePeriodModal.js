import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * Modal de seleção de período customizado
 * Permite selecionar intervalo de datas ou usar atalhos rápidos (7 dias, 30 dias)
 * 
 * @param {boolean} visible - Controla visibilidade do modal
 * @param {function} onClose - Callback ao fechar modal
 * @param {function} onApply - Callback ao aplicar período (recebe {startDate, endDate})
 * @param {Date} initialStartDate - Data inicial padrão
 * @param {Date} initialEndDate - Data final padrão
 */
export const DatePeriodModal = ({ 
    visible, 
    onClose, 
    onApply,
    initialStartDate = null,
    initialEndDate = null
}) => {
    const scrollViewRef = useRef(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(initialStartDate || new Date());
    const [tempEndDate, setTempEndDate] = useState(initialEndDate || new Date());

    // Atualiza datas temporárias quando o modal abre
    useEffect(() => {
        if (visible) {
            setTempStartDate(initialStartDate || new Date());
            setTempEndDate(initialEndDate || new Date());
            setShowStartPicker(false);
            setShowEndPicker(false);
        }
    }, [visible, initialStartDate, initialEndDate]);

    const handleOpenStartPicker = () => {
        setShowStartPicker(true);
        setShowEndPicker(false);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 80, animated: true });
        }, 200);
    };

    const handleConfirmStartDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }
        
        if (event.type === 'set' && selectedDate) {
            setTempStartDate(selectedDate);
            if (Platform.OS === 'ios') {
                setShowStartPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowStartPicker(false);
        }
    };

    const handleOpenEndPicker = () => {
        setShowEndPicker(true);
        setShowStartPicker(false);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 350, animated: true });
        }, 200);
    };

    const handleConfirmEndDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowEndPicker(false);
        }
        
        if (event.type === 'set' && selectedDate) {
            setTempEndDate(selectedDate);
            if (Platform.OS === 'ios') {
                setShowEndPicker(false);
            }
        } else if (event.type === 'dismissed') {
            setShowEndPicker(false);
        }
    };

    const handleApply = () => {
        onApply({ startDate: tempStartDate, endDate: tempEndDate });
        onClose();
    };

    const handleQuickFilter = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setTempStartDate(start);
        setTempEndDate(end);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity 
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.modal}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Período Customizado</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Conteúdo com Scroll */}
                        <ScrollView 
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.content}>
                                {/* Data Inicial */}
                                <View style={styles.dateRow}>
                                    <Text style={styles.dateLabel}>Data Inicial:</Text>
                                    <TouchableOpacity 
                                        style={styles.dateButton}
                                        onPress={handleOpenStartPicker}
                                    >
                                        <Ionicons name="calendar" size={20} color="#667eea" />
                                        <Text style={styles.dateText}>
                                            {tempStartDate?.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || 'Selecione'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* DateTimePicker para Data Inicial */}
                                {showStartPicker && tempStartDate && (
                                    <View style={styles.datePickerContainer}>
                                        <DateTimePicker
                                            value={tempStartDate}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                            onChange={handleConfirmStartDate}
                                            maximumDate={new Date()}
                                            locale="pt-BR"
                                            textColor="#333"
                                            accentColor="#667eea"
                                            themeVariant="light"
                                        />
                                    </View>
                                )}

                                <View style={styles.dateDivider} />

                                {/* Data Final */}
                                <View style={styles.dateRow}>
                                    <Text style={styles.dateLabel}>Data Final:</Text>
                                    <TouchableOpacity 
                                        style={styles.dateButton}
                                        onPress={handleOpenEndPicker}
                                    >
                                        <Ionicons name="calendar" size={20} color="#667eea" />
                                        <Text style={styles.dateText}>
                                            {tempEndDate?.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) || 'Selecione'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* DateTimePicker para Data Final */}
                                {showEndPicker && tempEndDate && (
                                    <View style={styles.datePickerContainer}>
                                        <DateTimePicker
                                            value={tempEndDate}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                            onChange={handleConfirmEndDate}
                                            maximumDate={new Date()}
                                            minimumDate={tempStartDate}
                                            locale="pt-BR"
                                            textColor="#333"
                                            accentColor="#667eea"
                                            themeVariant="light"
                                        />
                                    </View>
                                )}

                                {/* Atalhos Rápidos */}
                                <View style={styles.quickFilters}>
                                    <Text style={styles.quickFiltersLabel}>Atalhos:</Text>
                                    <View style={styles.quickFiltersRow}>
                                        <TouchableOpacity 
                                            style={styles.quickFilterChip}
                                            onPress={() => handleQuickFilter(7)}
                                        >
                                            <Text style={styles.quickFilterText}>Últimos 7 dias</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.quickFilterChip}
                                            onPress={() => handleQuickFilter(30)}
                                        >
                                            <Text style={styles.quickFilterText}>Últimos 30 dias</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Botões de Ação */}
                        <View style={styles.buttons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={handleApply}
                            >
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.applyGradient}
                                >
                                    <Text style={styles.applyText}>Aplicar</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 400,
        height: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    dateRow: {
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 12,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    datePickerContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dateDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16,
    },
    quickFilters: {
        marginTop: 20,
    },
    quickFiltersLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    quickFiltersRow: {
        flexDirection: 'row',
        gap: 8,
    },
    quickFilterChip: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    quickFilterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#667eea',
    },
    buttons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    applyButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    applyGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    applyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
