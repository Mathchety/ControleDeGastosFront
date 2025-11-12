import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ChangePasswordModal } from '../components/modals';
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
                    <Ionicons name={icon} size={moderateScale(22)} color="#667eea" />
                </View>
                <Text style={styles.infoLabel} numberOfLines={1}>{label}</Text>
            </View>
            <View style={styles.infoRight}>
                <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ccc" />
            </View>
        </TouchableOpacity>
    </AnimatedCard>
);

export default function ProfileScreen({ navigation }) {
    const { user: authUser, logout, changePassword } = useAuth();
    const insets = useSafeAreaInsets();
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    
    // Função para formatar a data de criação
    const formatMemberSince = (dateString) => {
        if (!dateString) return 'Data não disponível';
        
        try {
            const date = new Date(dateString);
            const months = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            
            return `${month} ${year}`;
        } catch (error) {
            return 'Data não disponível';
        }
    };
    
    // Log para debug - ver quais campos estão disponíveis
    useEffect(() => {
    }, []);
    
    const [user] = useState({
        name: authUser?.name || 'João Silva',
        email: authUser?.email || 'joao.silva@email.com',
        memberSince: formatMemberSince(authUser?.createdAt || authUser?.created_at),
        avatar: null, // URL da imagem ou null para placeholder
    });

    const handleEditProfile = () => {
        Alert.alert('Editar Perfil', 'Função em desenvolvimento');
    };

    const handleChangePassword = () => {
        setShowChangePasswordModal(true);
    };

    const handleChangePasswordSubmit = async ({ currentPassword, newPassword }) => {
        await changePassword(currentPassword, newPassword);
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
                <View style={styles.avatarContainer}>
                    {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={moderateScale(50)} color="#667eea" />
                        </View>
                    )}
                    <TouchableOpacity 
                        style={styles.editAvatarButton}
                        onPress={() => Alert.alert('Foto', 'Função em desenvolvimento')}
                    >
                        <Ionicons name="camera" size={moderateScale(18)} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.userInfoContainer}>
                    <Text 
                        style={styles.userName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {user.name}
                    </Text>
                    <Text 
                        style={styles.userEmail}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {user.email}
                    </Text>
                    <View style={styles.memberBadge}>
                        <Ionicons name="star" size={moderateScale(14)} color="#fbbf24" />
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

                {/* Espaçamento extra automático baseado no dispositivo */}
                <View style={{ 
                    height: Platform.OS === 'android' 
                        ? Math.max(insets.bottom + 20, 50)
                        : 30 
                }} />
            </ScrollView>

            {/* Modal de Trocar Senha */}
            <ChangePasswordModal
                visible={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                onSuccess={handleChangePasswordSubmit}
            />
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
    userInfoContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: moderateScale(20),
    },
    userName: {
        fontSize: theme.fonts.h2,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        width: '100%',
    },
    userEmail: {
        fontSize: theme.fonts.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: theme.spacing.xs,
        textAlign: 'center',
        width: '100%',
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
        marginBottom: moderateScale(15),
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoIconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12),
    },
    infoLabel: {
        fontSize: theme.fonts.body,
        color: '#666',
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: theme.fonts.body,
        fontWeight: '600',
        color: '#333',
        marginRight: moderateScale(8),
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        marginBottom: moderateScale(20),
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
        padding: moderateScale(15),
    },
    statValue: {
        fontSize: theme.fonts.h4,
        fontWeight: 'bold',
        color: '#333',
        marginTop: moderateScale(10),
    },
    statLabel: {
        fontSize: theme.fonts.caption,
        color: '#666',
        marginTop: moderateScale(5),
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: moderateScale(18),
        borderRadius: moderateScale(15),
        marginBottom: moderateScale(20),
        borderWidth: 2,
        borderColor: '#fee2e2',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: theme.fonts.body,
        fontWeight: 'bold',
        marginLeft: moderateScale(10),
    },
});
