import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';

/**
 * Card moderno padronizado para listas
 * @param {function} onPress - Função ao clicar no card
 * @param {string} icon - Ícone principal (Ionicons)
 * @param {string} iconColor - Cor do ícone
 * @param {string} iconBg - Cor de fundo do ícone
 * @param {string} title - Título principal
 * @param {string} subtitle - Subtítulo (opcional)
 * @param {string} value - Valor principal (ex: preço)
 * @param {string} valueColor - Cor do valor
 * @param {string} badge - Badge/tag (ex: "5 itens")
 * @param {string} badgeColor - Cor do badge
 * @param {node} leftContent - Conteúdo customizado à esquerda
 * @param {node} rightContent - Conteúdo customizado à direita
 */
export const ModernCard = ({
    onPress,
    icon,
    iconColor = '#667eea',
    iconBg = '#f0f4ff',
    title,
    subtitle,
    value,
    valueColor = '#ef4444',
    badge,
    badgeColor = '#667eea',
    leftContent,
    rightContent,
    showChevron = true,
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                {/* Lado Esquerdo */}
                {leftContent || (
                    <>
                        {icon && (
                            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                                <Ionicons name={icon} size={24} color={iconColor} />
                            </View>
                        )}
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                            {subtitle && (
                                <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
                            )}
                        </View>
                    </>
                )}

                {/* Lado Direito */}
                {rightContent || (
                    <View style={styles.cardRight}>
                        {value && (
                            <Text style={[styles.cardValue, { color: valueColor }]}>{value}</Text>
                        )}
                        {badge && (
                            <Text style={[styles.cardBadge, { color: badgeColor }]}>{badge}</Text>
                        )}
                        {showChevron && (
                            <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chevron} />
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12),
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(4),
    },
    cardSubtitle: {
        fontSize: moderateScale(13),
        color: '#999',
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    cardValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        marginBottom: moderateScale(4),
    },
    cardBadge: {
        fontSize: moderateScale(12),
        fontWeight: '500',
        marginBottom: moderateScale(4),
    },
    chevron: {
        marginTop: moderateScale(4),
    },
});
