import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, fontScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

export const Input = forwardRef(({ 
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
    required = false,
    maxLength = 255,
    autoCapitalize = 'none',
    onFocus: externalOnFocus,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit = true,
}, ref) => {
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
                {required && (
                    <Text style={styles.requiredAsterisk} accessibilityLabel="Campo obrigatório">*</Text>
                )}
                <TextInput
                    ref={ref}
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
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={blurOnSubmit}
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
});

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: isSmallDevice ? moderateScale(14) : moderateScale(10),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: moderateScale(12),
        borderWidth: 1.5,
        borderColor: '#e9ecef',
        minHeight: moderateScale(48),
    },
    inputError: {
        backgroundColor: '#fef2f2',
    },
    inputIcon: {
        marginRight: moderateScale(8),
    },
    input: {
        flex: 1,
        paddingVertical: moderateScale(12),
        fontSize: moderateScale(14),
        color: '#333',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: moderateScale(8),
    },
    errorText: {
        color: '#ef4444',
        fontSize: moderateScale(12),
        marginTop: moderateScale(3),
        marginLeft: moderateScale(12),
        fontWeight: '500',
    },
    requiredAsterisk: {
        color: theme.colors.danger,
        fontWeight: '700',
        marginRight: moderateScale(6),
        fontSize: moderateScale(16),
        alignSelf: 'center',
    },
});
