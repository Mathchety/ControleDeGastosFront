import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ReceiptSummaryCard = ({ storeName, subtotal, discount, total, actionButton }) => (
    <View style={styles.summaryCard}>
        {/* Botão de ação no canto superior direito (ex: deletar) */}
        {actionButton && (
            <View style={styles.actionButtonContainer}>
                {actionButton}
            </View>
        )}
        
        <View style={styles.storeHeader}>
            <Ionicons name="storefront" size={theme.iconSizes.xxl} color={theme.colors.primary} />
            <Text style={styles.storeName} numberOfLines={2} adjustsFontSizeToFit>
                {storeName || 'Loja'}
            </Text>
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
        borderRadius: theme.radius.xl,
        padding: moderateScale(24),
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
        position: 'relative',
    },
    actionButtonContainer: {
        position: 'absolute',
        top: moderateScale(16),
        right: moderateScale(16),
        zIndex: 10,
    },
    storeHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    storeName: {
        fontSize: fontScale(24),
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: theme.spacing.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: theme.spacing.xs,
    },
    totalLabel: {
        fontSize: theme.fonts.body,
        color: theme.colors.textSecondary,
    },
    totalValue: {
        fontSize: theme.fonts.body,
        color: theme.colors.text,
        fontWeight: '600',
    },
    discountValue: {
        color: theme.colors.success,
    },
    totalLabelBold: {
        fontSize: fontScale(20),
        fontWeight: '700',
        color: theme.colors.text,
    },
    totalValueBold: {
        fontSize: fontScale(24),
        fontWeight: '700',
        color: theme.colors.primary,
    },
});
