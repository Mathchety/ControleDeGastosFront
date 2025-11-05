import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from './AnimatedCard';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const StatCard = ({ icon, title, value, color, delay = 0, onPress }) => (
    <AnimatedCard delay={delay} style={styles.statCard}>
        <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={theme.iconSizes.lg} color={color} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <Text style={styles.statTitle} numberOfLines={2}>{title}</Text>
        </TouchableOpacity>
    </AnimatedCard>
);

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        marginHorizontal: moderateScale(5),
        padding: moderateScale(12),
    },
    statCardContent: {
        alignItems: 'center',
    },
    statIconContainer: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(24),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    statValue: {
        fontSize: theme.fonts.h4,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    statTitle: {
        fontSize: theme.fonts.caption,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
