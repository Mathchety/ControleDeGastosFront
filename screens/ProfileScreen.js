import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

// Componente de Card Animado
const AnimatedCard = ({ children, delay = 0 }) => (
    <View>
        {children}
    </View>
);

// Componente de Item de Informação
const InfoItem = ({ icon, label, value, onPress, delay }) => (
    <AnimatedCard delay={delay}>
        <TouchableOpacity 
            style={styles.infoItem}
            onPress={onPress}
        >
            <View style={styles.infoLeft}>
                <View style={styles.infoIconContainer}>
                    <Ionicons name={icon} size={22} color="#667eea" />
                </View>
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{value}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    </AnimatedCard>
);

export default function ProfileScreen({ navigation }) {
    const { user: authUser, logout } = useAuth();
    
    const [user] = useState({
        name: authUser?.name || 'João Silva',
        email: authUser?.email || 'joao.silva@email.com',
        memberSince: 'Outubro 2025',
        avatar: null, // URL da imagem ou null para placeholder
    });

    const handleEditProfile = () => {
        Alert.alert('Editar Perfil', 'Função em desenvolvimento');
    };

    const handleChangePassword = () => {
        Alert.alert('Alterar Senha', 'Função em desenvolvimento');
    };

    const handleViewCategories = () => {
        navigation.navigate('Categories');
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Sair', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header com Gradiente */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <View
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500 }}
                    style={styles.avatarContainer}
                >
                    {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={50} color="#667eea" />
                        </View>
                    )}
                    <TouchableOpacity 
                        style={styles.editAvatarButton}
                        onPress={() => Alert.alert('Foto', 'Função em desenvolvimento')}
                    >
                        <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 200 }}
                >
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.memberBadge}>
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text style={styles.memberText}>Membro desde {user.memberSince}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Informações Pessoais */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                    
                    <InfoItem
                        icon="person-outline"
                        label="Nome Completo"
                        value={user.name}
                        onPress={handleEditProfile}
                        delay={100}
                    />
                    
                    <InfoItem
                        icon="mail-outline"
                        label="E-mail"
                        value={user.email}
                        onPress={handleEditProfile}
                        delay={150}
                    />
                    
                </View>

                {/* Segurança */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    
                    <InfoItem
                        icon="lock-closed-outline"
                        label="Alterar Senha"
                        value=""
                        onPress={handleChangePassword}
                        delay={250}
                    />
                    
                    <InfoItem
                        icon="shield-checkmark-outline"
                        label="Autenticação em Dois Fatores"
                        value="Desativada"
                        onPress={() => Alert.alert('2FA', 'Função em desenvolvimento')}
                        delay={300}
                    />
                </View>

                {/* Categorias */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                    
                    <InfoItem
                        icon="pricetags-outline"
                        label="Ver Categorias"
                        value=""
                        onPress={handleViewCategories}
                        delay={350}
                    />
                </View>

                {/* Estatísticas */}
                {/* <AnimatedCard delay={350}>
                    <View style={styles.statsCard}>
                        <Text style={styles.sectionTitle}>Estatísticas</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Ionicons name="wallet" size={30} color="#667eea" />
                                <Text style={styles.statValue}>127</Text>
                                <Text style={styles.statLabel}>Transações</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="trending-up" size={30} color="#10b981" />
                                <Text style={styles.statValue}>R$ 15.2k</Text>
                                <Text style={styles.statLabel}>Receitas</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="trending-down" size={30} color="#ef4444" />
                                <Text style={styles.statValue}>R$ 8.7k</Text>
                                <Text style={styles.statLabel}>Despesas</Text>
                            </View>
                        </View>
                    </View>
                </AnimatedCard> */}

                {/* Botão de Sair */}
                <AnimatedCard delay={400}>
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                        <Text style={styles.logoutText}>Sair da Conta</Text>
                    </TouchableOpacity>
                </AnimatedCard>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: moderateScale(60),
        paddingBottom: moderateScale(40),
        alignItems: 'center',
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: theme.spacing.md,
    },
    avatar: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
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
        backgroundColor: theme.colors.primary,
        width: moderateScale(35),
        height: moderateScale(35),
        borderRadius: moderateScale(17.5),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: theme.fonts.h2,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    userEmail: {
        fontSize: theme.fonts.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.md,
        marginTop: theme.spacing.sm,
    },
    memberText: {
        color: '#fff',
        fontSize: theme.fonts.caption,
        marginLeft: theme.spacing.xs,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.lg,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    sectionTitle: {
        fontSize: theme.fonts.h4,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 15,
        color: '#666',
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 15,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#fee2e2',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
