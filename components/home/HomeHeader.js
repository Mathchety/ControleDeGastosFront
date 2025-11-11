import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const HomeHeader = ({ userName, opacity = 1 }) => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
    >
        <Animated.View style={[styles.headerContent, { opacity }] }>
            <Text style={styles.headerTitle}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={styles.headerSubtitle}>Aqui está o resumo das suas finanças recentes</Text>
        </Animated.View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(30),
        paddingHorizontal: theme.spacing.lg,
        
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        gap: theme.spacing.xs,
    },
    headerTitle: {
        fontSize: theme.fonts.h1,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: theme.fonts.body,
        color: 'rgba(255, 255, 255, 0.9)',
    },
});
