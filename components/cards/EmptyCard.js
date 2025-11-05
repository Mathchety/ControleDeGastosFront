import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const EmptyCard = ({ icon, title, message, action, onAction }) => (
    <View style={styles.emptyCard}>
        <Ionicons name={icon} size={moderateScale(80)} color="#ccc" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && onAction && (
            <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
                <Text style={styles.emptyActionText}>{action}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(40),
        backgroundColor: '#fff',
        borderRadius: theme.radius.xl,
        marginVertical: theme.spacing.lg,
    },
    emptyTitle: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    emptyMessage: {
        fontSize: theme.fonts.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    emptyAction: {
        paddingHorizontal: moderateScale(24),
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
    },
    emptyActionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: theme.fonts.body,
    },
});
