import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Header da tela de perfil com avatar e informações do usuário
 * @param {object} user - Dados do usuário
 * @param {function} onEditAvatar - Função ao pressionar editar avatar
 */
export const ProfileHeader = ({ user, onEditAvatar }) => (
    <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
    >
        <View style={styles.avatarContainer}>
            {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={50} color="#667eea" />
                </View>
            )}
            <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={onEditAvatar || (() => Alert.alert('Foto', 'Função em desenvolvimento'))}
            >
                <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        <View style={styles.memberBadge}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.memberText}>
                Membro desde {user?.memberSince || 'Outubro 2025'}
            </Text>
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#667eea',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 5,
        textAlign: 'center',
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginTop: 10,
    },
    memberText: {
        color: '#fff',
        fontSize: 13,
        marginLeft: 5,
    },
});
