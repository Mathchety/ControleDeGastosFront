import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '../../utils/responsive';

/**
 * 📡 Banner Offline - Notificação não invasiva
 * Mostra um banner no topo quando o app está sem internet
 */
export default function OfflineBanner({ visible }) {
    const insets = useSafeAreaInsets();
    
    if (!visible) return null;

    return (
        <View style={[styles.banner, { paddingTop: insets.top > 0 ? insets.top : moderateScale(8) }]}>
            <View style={styles.content}>
                <Ionicons name="cloud-offline-outline" size={moderateScale(16)} color="#fff" />
                <Text style={styles.text}>Modo Offline</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#f59e0b',
        paddingBottom: moderateScale(8),
        paddingHorizontal: moderateScale(16),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(6),
    },
    text: {
        color: '#fff',
        fontSize: moderateScale(13),
        fontWeight: '600',
    },
});
