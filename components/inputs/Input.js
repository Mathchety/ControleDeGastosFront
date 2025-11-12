import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const Input = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    keyboardType = 'default',
    showToggle = false,
    onToggle,
    style,
    error,
    maxLength = 255
}) => (
    <View>
        <View style={[styles.inputContainer, error && styles.inputError, style]}>
            {icon && (
                <Ionicons 
                    name={icon} 
                    size={theme.iconSizes.md} 
                    color={error ? theme.colors.danger : theme.colors.textSecondary} 
                    style={styles.inputIcon} 
                />
            )}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={error ? '#fca5a5' : theme.colors.textLight}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize="none"
                maxLength={maxLength}
            />
            {showToggle && (
                <TouchableOpacity onPress={onToggle}>
                    <Ionicons 
                        name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                        size={theme.iconSizes.md} 
                        color={theme.colors.textSecondary} 
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputError: {
        borderColor: theme.colors.danger,
        backgroundColor: '#fef2f2',
    },
    inputIcon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: moderateScale(16),
        fontSize: theme.fonts.body,
        color: theme.colors.text,
    },
    eyeIcon: {
        padding: theme.spacing.sm,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: theme.fonts.caption,
        marginTop: moderateScale(-10),
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.md,
    },
});
