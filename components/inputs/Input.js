import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
    maxLength = 255,
    autoCapitalize = 'none',
    onFocus: externalOnFocus, // forwarded onFocus prop
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animatedFocus] = useState(new Animated.Value(0));

    const handleFocus = () => {
        setIsFocused(true);
        // Call external onFocus if provided
        if (typeof externalOnFocus === 'function') {
            try { externalOnFocus(); } catch (e) { /* ignore */ }
        }
        Animated.spring(animatedFocus, {
            toValue: 1,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(animatedFocus, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
    };

    const borderColor = animatedFocus.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? theme.colors.danger : '#e9ecef', error ? theme.colors.danger : '#667eea'],
    });

    const shadowOpacity = animatedFocus.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.15],
    });

    const scale = animatedFocus.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
    });

    return (
        <View style={styles.wrapper}>
            <Animated.View 
                style={[
                    styles.inputContainer, 
                    error && styles.inputError, 
                    style,
                    {
                        borderColor,
                        transform: [{ scale }],
                        shadowOpacity,
                        shadowColor: '#667eea',
                        shadowOffset: { width: 0, height: 4 },
                        shadowRadius: 12,
                        elevation: isFocused ? 8 : 2,
                    }
                ]}
            >
                {icon && (
                    <Ionicons 
                        name={icon} 
                        size={theme.iconSizes.md} 
                        color={isFocused ? '#667eea' : (error ? theme.colors.danger : theme.colors.textSecondary)} 
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
                    autoCapitalize={autoCapitalize}
                    maxLength={maxLength}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {showToggle && (
                    <TouchableOpacity onPress={onToggle}>
                        <Ionicons 
                            name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                            size={theme.iconSizes.md} 
                            color={isFocused ? '#667eea' : theme.colors.textSecondary} 
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: theme.spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 2,
        borderColor: '#e9ecef',
        minHeight: moderateScale(56),
    },
    inputError: {
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
        fontWeight: '500',
    },
    eyeIcon: {
        padding: theme.spacing.sm,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: theme.fonts.caption,
        marginTop: moderateScale(4),
        marginLeft: theme.spacing.md,
        fontWeight: '500',
    },
});
