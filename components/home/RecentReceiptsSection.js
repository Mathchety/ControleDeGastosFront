import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecentReceiptItem } from './RecentReceiptItem';
import { LoadingOverlay } from '../common';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

/**
 * Seção de notas recentes
 * @param {boolean} loading - Estado de carregamento
 * @param {Array} receipts - Lista de notas fiscais
 * @param {Array} storeNameList - Lista de nomes de lojas
 * @param {Array} itemCountList - Lista de quantidade de itens
 * @param {Array} dateList - Lista de datas
 * @param {function} onReceiptPress - Função ao clicar em uma nota
 * @param {function} onViewAll - Função ao clicar em "Ver mais"
 */
export const RecentReceiptsSection = ({ 
    loading, 
    receipts, 
    storeNameList, 
    itemCountList, 
    dateList,
    onReceiptPress,
    onViewAll
}) => {
    const [isNavigating, setIsNavigating] = useState(false);

    const handleReceiptPress = useCallback((receiptId) => {
        if (isNavigating) {
            return;
        }
        
        setIsNavigating(true);
        onReceiptPress && onReceiptPress(receiptId);
        
        // Reseta após a navegação
        setTimeout(() => setIsNavigating(false), 1000);
    }, [isNavigating, onReceiptPress]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notas Recentes</Text>
            </View>

            {/* ✨ Loading padronizado */}
            {loading && receipts.length === 0 ? (
                <LoadingOverlay 
                    visible={true}
                    message="Carregando notas..."
                />
            ) : receipts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={moderateScale(64)} color="#ccc" />
                    <Text style={styles.emptyText}>Nenhuma nota fiscal ainda</Text>
                    <Text style={styles.emptySubtext}>Escaneie seu primeiro QR Code!</Text>
                </View>
            ) : (
                <>
                    <View style={styles.receiptsList}>
                        {receipts.slice(0, 3).map((receipt, index) => (
                            <RecentReceiptItem
                                key={receipt.id}
                                receipt={receipt}
                                storeName={storeNameList[index]}
                                itemCount={itemCountList[index]}
                                date={dateList[index] ? new Date(dateList[index]).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    timeZone: 'America/Sao_Paulo'
                                }) : ''}
                                onPress={() => handleReceiptPress(receipt.id)}
                            />
                        ))}
                    </View>
                    
                    {receipts.length >= 3 && (
                        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                            <Text style={styles.viewAllText}>Ver todas as notas</Text>
                            <Ionicons name="arrow-forward" size={theme.iconSizes.md} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    loadingContainer: {
        padding: moderateScale(40),
        alignItems: 'center',
    },
    loadingText: {
        fontSize: theme.fonts.body,
        color: theme.colors.textLight,
    },
    emptyContainer: {
        padding: moderateScale(40),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: fontScale(18),
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    emptySubtext: {
        fontSize: theme.fonts.body,
        color: theme.colors.textLight,
        marginTop: theme.spacing.xs,
    },
    receiptsList: {
        marginTop: theme.spacing.xs,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.sm,
        backgroundColor: '#f0f0ff',
    },
    viewAllText: {
        fontSize: fontScale(15),
        fontWeight: '600',
        color: theme.colors.primary,
        marginRight: theme.spacing.xs,
    },
});
