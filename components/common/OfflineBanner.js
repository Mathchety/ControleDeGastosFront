import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';

/**
 * 📡 Banner Offline - Notificação não invasiva
 * Mostra um banner no topo quando o app está sem internet
 */
export default function OfflineBanner({ visible }) {
    if (!visible) return null;

    return (
        <View style={styles.banner}>
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
        paddingVertical: moderateScale(8),
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
