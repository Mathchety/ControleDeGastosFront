import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

/**
 * Header com gradiente padronizado para todas as telas
 * @param {string} icon - Nome do ícone do Ionicons
 * @param {string} title - Título principal
 * @param {string} subtitle - Subtítulo (opcional)
 * @param {array} colors - Cores do gradiente (opcional, padrão: roxo)
 * @param {ReactNode} leftButton - Botão personalizado à esquerda (ex: voltar)
 * @param {ReactNode} children - Conteúdo adicional abaixo do header
 */
export const GradientHeader = ({ 
    icon, 
    title, 
    subtitle, 
    colors = ['#667eea', '#764ba2'],
    leftButton,
    children 
}) => {
    return (
        <LinearGradient 
            colors={colors} 
            style={styles.header}
        >
            {/* Botão à esquerda (se fornecido) */}
            {leftButton && (
                <View style={styles.leftButtonContainer}>
                    {leftButton}
                </View>
            )}
            
            <View style={styles.headerContent}>
                {icon && (
                    <View style={styles.headerIcon}>
                        <Ionicons name={icon} size={32} color="#fff" />
                    </View>
                )}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.headerSubtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(30),
        paddingHorizontal: moderateScale(20),
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    leftButtonContainer: {
        position: 'absolute',
        top: moderateScale(70),
        left: moderateScale(20),
        zIndex: 100,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
        marginLeft: moderateScale(50),
    },
    headerIcon: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(15),
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: moderateScale(12),
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: moderateScale(4),
    },
});
