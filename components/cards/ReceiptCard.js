import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from './AnimatedCard';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ReceiptCard = ({ 
    storeName, 
    date, 
    total, 
    itemCount, 
    delay = 0,
    onPress 
}) => (
    <AnimatedCard delay={delay} style={styles.receiptCard}>
        <TouchableOpacity onPress={onPress} style={styles.receiptContent}>
            <View style={styles.receiptIcon}>
                <Ionicons name="receipt-outline" size={theme.iconSizes.xxl} color={theme.colors.primary} />
            </View>
            <View style={styles.receiptDetails}>
                <Text style={styles.receiptStoreName} numberOfLines={1}>{storeName}</Text>
                <Text style={styles.receiptDate}>{date}</Text>
                <Text style={styles.receiptItems}>{itemCount} itens</Text>
            </View>
            <View style={styles.receiptRight}>
                <Text style={styles.receiptTotal}>R$ {total}</Text>
                <Ionicons name="chevron-forward" size={theme.iconSizes.md} color="#ccc" />
            </View>
        </TouchableOpacity>
    </AnimatedCard>
);

const styles = StyleSheet.create({
    receiptCard: {
        padding: 0,
    },
    receiptContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    receiptIcon: {
        marginRight: theme.spacing.md,
    },
    receiptDetails: {
        flex: 1,
    },
    receiptStoreName: {
        fontSize: theme.fonts.body,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    receiptDate: {
        fontSize: fontScale(13),
        color: theme.colors.textSecondary,
        marginBottom: moderateScale(2),
    },
    receiptItems: {
        fontSize: theme.fonts.caption,
        color: theme.colors.textLight,
    },
    receiptRight: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    receiptTotal: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginRight: theme.spacing.xs,
    },
});
