import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FinansyncLogo } from '../common';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const AuthHeader = () => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <FinansyncLogo size={moderateScale(80)} showCircle={false} />
        <Text style={styles.headerTitle}>Finansync</Text>
        <Text style={styles.headerSubtitle}>Sincronize suas finanças com inteligência</Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingVertical: moderateScale(50),
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
        ...theme.shadows.medium,
    },
    headerTitle: {
        fontSize: theme.fonts.h1,
        fontWeight: '700',
        color: '#fff',
        marginTop: theme.spacing.md,
    },
    headerSubtitle: {
        fontSize: theme.fonts.body,
        color: '#fff',
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },
});
