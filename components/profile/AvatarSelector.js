import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';

// 🎨 Lista de avatares genéricos 2D (sem copyright)
export const AVATAR_OPTIONS = [
    { id: 'user-1', icon: 'person', color: '#667eea', bgColor: '#eef2ff' },
    { id: 'user-2', icon: 'person-circle', color: '#06b6d4', bgColor: '#ecfeff' },
    { id: 'user-3', icon: 'happy', color: '#10b981', bgColor: '#d1fae5' },
    { id: 'user-4', icon: 'glasses', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 'user-5', icon: 'man', color: '#8b5cf6', bgColor: '#f5f3ff' },
    { id: 'user-6', icon: 'woman', color: '#ec4899', bgColor: '#fce7f3' },
    { id: 'user-7', icon: 'american-football', color: '#ef4444', bgColor: '#fee2e2' },
    { id: 'user-8', icon: 'baseball', color: '#f97316', bgColor: '#ffedd5' },
    { id: 'user-9', icon: 'basketball', color: '#eab308', bgColor: '#fef9c3' },
    { id: 'user-10', icon: 'bicycle', color: '#84cc16', bgColor: '#ecfccb' },
    { id: 'user-11', icon: 'boat', color: '#06b6d4', bgColor: '#cffafe' },
    { id: 'user-12', icon: 'car-sport', color: '#3b82f6', bgColor: '#dbeafe' },
    { id: 'user-13', icon: 'cafe', color: '#a855f7', bgColor: '#f3e8ff' },
    { id: 'user-14', icon: 'pizza', color: '#f43f5e', bgColor: '#ffe4e6' },
    { id: 'user-15', icon: 'ice-cream', color: '#ec4899', bgColor: '#fce7f3' },
    { id: 'user-16', icon: 'heart', color: '#be123c', bgColor: '#ffe4e6' },
    { id: 'user-17', icon: 'flame', color: '#ea580c', bgColor: '#ffedd5' },
    { id: 'user-18', icon: 'sunny', color: '#facc15', bgColor: '#fef9c3' },
    { id: 'user-19', icon: 'moon', color: '#6366f1', bgColor: '#e0e7ff' },
    { id: 'user-20', icon: 'star', color: '#eab308', bgColor: '#fef9c3' },
    { id: 'user-21', icon: 'trophy', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 'user-22', icon: 'game-controller', color: '#8b5cf6', bgColor: '#f5f3ff' },
    { id: 'user-23', icon: 'headset', color: '#06b6d4', bgColor: '#ecfeff' },
    { id: 'user-24', icon: 'musical-notes', color: '#d946ef', bgColor: '#fae8ff' },
    { id: 'user-25', icon: 'camera', color: '#0ea5e9', bgColor: '#e0f2fe' },
    { id: 'user-26', icon: 'brush', color: '#10b981', bgColor: '#d1fae5' },
    { id: 'user-27', icon: 'color-palette', color: '#a855f7', bgColor: '#f3e8ff' },
    { id: 'user-28', icon: 'rocket', color: '#ef4444', bgColor: '#fee2e2' },
    { id: 'user-29', icon: 'planet', color: '#6366f1', bgColor: '#e0e7ff' },
    { id: 'user-30', icon: 'leaf', color: '#22c55e', bgColor: '#dcfce7' },
];

/**
 * Componente de Avatar do usuário
 * @param {string} avatarId - ID do avatar selecionado
 * @param {number} size - Tamanho do avatar
 */
export const UserAvatar = ({ avatarId, size = 80 }) => {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
    
    return (
        <View style={[
            styles.avatarContainer,
            { 
                width: size, 
                height: size, 
                borderRadius: size / 2,
                backgroundColor: avatar.bgColor 
            }
        ]}>
            <Ionicons name={avatar.icon} size={size * 0.5} color={avatar.color} />
        </View>
    );
};

/**
 * Modal de Seleção de Avatar
 * @param {boolean} visible - Controla visibilidade
 * @param {function} onClose - Callback ao fechar
 * @param {function} onSelect - Callback ao selecionar avatar (recebe avatarId)
 * @param {string} currentAvatarId - Avatar atualmente selecionado
 */
export const AvatarSelectorModal = ({ visible, onClose, onSelect, currentAvatarId }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Escolher Avatar</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Grid de Avatares */}
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.avatarGrid}
                    >
                        {AVATAR_OPTIONS.map((avatar) => (
                            <TouchableOpacity
                                key={avatar.id}
                                style={[
                                    styles.avatarOption,
                                    currentAvatarId === avatar.id && styles.avatarOptionSelected
                                ]}
                                onPress={() => {
                                    onSelect(avatar.id);
                                    onClose();
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.avatarOptionInner,
                                    { backgroundColor: avatar.bgColor }
                                ]}>
                                    <Ionicons name={avatar.icon} size={32} color={avatar.color} />
                                </View>
                                {currentAvatarId === avatar.id && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        justifyContent: 'center', // ✨ Centraliza os ícones
        gap: 15,
    },
    avatarOption: {
        width: '22%',
        aspectRatio: 1,
        marginBottom: 10,
        position: 'relative',
    },
    avatarOptionSelected: {
        transform: [{ scale: 1.05 }],
    },
    avatarOptionInner: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    checkmark: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
});
