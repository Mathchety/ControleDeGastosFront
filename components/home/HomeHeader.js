import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale, fontScale, verticalScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const HomeHeader = ({ userName, opacity }) => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
    >
        <Animated.View style={[styles.headerContent, { opacity: opacity || 1 }]}>
            <View>
                <Text style={styles.greeting}>Olá, 👋</Text>
                <Text style={styles.userName}>{userName || 'Usuário'}</Text>
            </View>
        </Animated.View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 20,
        paddingHorizontal: theme.spacing.lg,
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        fontSize: theme.fonts.body,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    userName: {
        fontSize: theme.fonts.h1,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: theme.spacing.xs,
    },
});
