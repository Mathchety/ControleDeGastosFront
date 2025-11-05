import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const RecentReceiptItem = ({ receipt, storeName, date, itemCount, onPress }) => (
    <TouchableOpacity style={styles.receiptItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.receiptIcon}>
            <Ionicons name="receipt" size={theme.iconSizes.md} color={theme.colors.primary} />
        </View>
        <View style={styles.receiptDetails}>
            <Text style={styles.receiptStore} numberOfLines={1}>{storeName || 'Loja'}</Text>
            <Text style={styles.receiptItemsCount}>{itemCount || 0} itens</Text>
            <Text style={styles.receiptDate}>{date}</Text>
        </View>
        <View style={styles.receiptRight}>
            <Text style={styles.receiptAmount}>
                R$ {parseFloat(receipt.total || 0).toFixed(2)}
            </Text>
            <Ionicons name="chevron-forward" size={theme.iconSizes.md} color={theme.colors.textLight} style={styles.chevron} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    receiptItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    receiptIcon: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    receiptDetails: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    receiptStore: {
        fontSize: theme.fonts.body,
        fontWeight: '600',
        color: theme.colors.text,
    },
    receiptItemsCount: {
        fontSize: fontScale(13),
        color: theme.colors.textSecondary,
        marginTop: moderateScale(2),
    },
    receiptDate: {
        fontSize: fontScale(13),
        color: theme.colors.textLight,
        marginTop: moderateScale(2),
    },
    receiptRight: {
        alignItems: 'flex-end',
    },
    receiptAmount: {
        fontSize: theme.fonts.body,
        fontWeight: 'bold',
        color: theme.colors.danger,
    },
    chevron: {
        marginTop: theme.spacing.xs,
    },
});
