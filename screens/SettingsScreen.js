import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Switch, 
    TouchableOpacity, 
    ScrollView,
    Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Componente de Card Animado (simplificado sem moti)
const AnimatedCard = ({ children, delay = 0 }) => (
    <View>
        {children}
    </View>
);

// Componente de Item de Configuração com Switch
const SettingToggle = ({ icon, label, description, value, onValueChange, delay }) => (
    <AnimatedCard delay={delay}>
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                    <Ionicons name={icon} size={22} color="#667eea" />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {description && (
                        <Text style={styles.settingDescription}>{description}</Text>
                    )}
                </View>
            </View>
            <Switch
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={value ? "#667eea" : "#f4f4f5"}
                ios_backgroundColor="#d1d5db"
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    </AnimatedCard>
);

// Componente de Item de Configuração com Navegação
const SettingNavItem = ({ icon, label, value, onPress, delay, color = '#333' }) => (
    <AnimatedCard delay={delay}>
        <TouchableOpacity 
            style={styles.settingItem}
            onPress={onPress}
        >
            <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                    <Ionicons name={icon} size={22} color="#667eea" />
                </View>
                <Text style={[styles.settingLabel, { color }]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    </AnimatedCard>
);

export default function SettingsScreen({ navigation }) {
    // Estados das configurações
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [autoBackup, setAutoBackup] = useState(true);

    const handleClearCache = () => {
        Alert.alert(
            'Limpar Cache',
            'Deseja realmente limpar o cache do aplicativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Limpar', 
                    onPress: () => Alert.alert('Sucesso', 'Cache limpo com sucesso!')
                }
            ]
        );
    };

    const handleExportData = () => {
        Alert.alert('Exportar Dados', 'Função em desenvolvimento');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Excluir Conta',
            'Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Confirmação', 'Por favor, entre em contato com o suporte.')
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
                <View>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="settings" size={40} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Configurações</Text>
                    <Text style={styles.headerSubtitle}>Personalize seu aplicativo</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Notificações */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notificações</Text>
                    
                    <SettingToggle
                        icon="notifications"
                        label="Notificações"
                        description="Ativar todas as notificações"
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        delay={100}
                    />
                    
                    <SettingToggle
                        icon="phone-portrait"
                        label="Notificações Push"
                        description="Receber alertas no dispositivo"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        delay={150}
                    />
                    
                    <SettingToggle
                        icon="mail"
                        label="E-mail"
                        description="Receber resumos por e-mail"
                        value={emailNotifications}
                        onValueChange={setEmailNotifications}
                        delay={200}
                    />
                </View>

                {/* Aparência */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aparência</Text>
                    
                    <SettingToggle
                        icon="moon"
                        label="Modo Escuro"
                        description="Em breve"
                        value={darkModeEnabled}
                        onValueChange={setDarkModeEnabled}
                        delay={250}
                    />
                    
                    <SettingNavItem
                        icon="color-palette"
                        label="Tema"
                        value="Padrão"
                        onPress={() => Alert.alert('Tema', 'Função em desenvolvimento')}
                        delay={300}
                    />
                    
                    <SettingNavItem
                        icon="language"
                        label="Idioma"
                        value="Português (BR)"
                        onPress={() => Alert.alert('Idioma', 'Função em desenvolvimento')}
                        delay={350}
                    />
                </View>

                {/* Segurança */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    
                    <SettingToggle
                        icon="finger-print"
                        label="Autenticação Biométrica"
                        description="Usar impressão digital ou Face ID"
                        value={biometricEnabled}
                        onValueChange={setBiometricEnabled}
                        delay={400}
                    />
                    
                    <SettingNavItem
                        icon="lock-closed"
                        label="Alterar PIN"
                        onPress={() => Alert.alert('PIN', 'Função em desenvolvimento')}
                        delay={450}
                    />
                </View>

                {/* Dados e Armazenamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados e Armazenamento</Text>
                    
                    <SettingToggle
                        icon="cloud-upload"
                        label="Backup Automático"
                        description="Salvar dados na nuvem"
                        value={autoBackup}
                        onValueChange={setAutoBackup}
                        delay={500}
                    />
                    
                    <SettingNavItem
                        icon="download"
                        label="Exportar Dados"
                        onPress={handleExportData}
                        delay={550}
                    />
                    
                    <SettingNavItem
                        icon="trash"
                        label="Limpar Cache"
                        onPress={handleClearCache}
                        delay={600}
                    />
                </View>

                {/* Sobre */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre</Text>
                    
                    <SettingNavItem
                        icon="information-circle"
                        label="Versão do App"
                        value="1.0.0"
                        onPress={() => {}}
                        delay={650}
                    />
                    
                    <SettingNavItem
                        icon="document-text"
                        label="Termos de Uso"
                        onPress={() => Alert.alert('Termos', 'Função em desenvolvimento')}
                        delay={700}
                    />
                    
                    <SettingNavItem
                        icon="shield-checkmark"
                        label="Política de Privacidade"
                        onPress={() => Alert.alert('Privacidade', 'Função em desenvolvimento')}
                        delay={750}
                    />
                    
                    <SettingNavItem
                        icon="help-circle"
                        label="Ajuda e Suporte"
                        onPress={() => Alert.alert('Suporte', 'Entre em contato: suporte@app.com')}
                        delay={800}
                    />
                </View>

                {/* Zona de Perigo */}
                <View style={[styles.section, styles.dangerSection]}>
                    <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de Perigo</Text>
                    
                    <SettingNavItem
                        icon="warning"
                        label="Excluir Conta"
                        onPress={handleDeleteAccount}
                        delay={850}
                        color="#ef4444"
                    />
                </View>

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
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 5,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    section: {
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    settingDescription: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    dangerSection: {
        borderWidth: 2,
        borderColor: '#fee2e2',
        backgroundColor: '#fef2f2',
    },
    dangerTitle: {
        color: '#ef4444',
    },
});
