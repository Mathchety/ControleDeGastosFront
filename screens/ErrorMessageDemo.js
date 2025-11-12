import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ErrorMessage, useErrorMessage } from '../components/common';
import { moderateScale } from '../utils/responsive';
import { theme } from '../utils/theme';

/**
 * Tela de demonstração do componente ErrorMessage
 * Para testar: navigation.navigate('ErrorDemo')
 */
export default function ErrorMessageDemo() {
    const { getErrorMessage } = useErrorMessage();
    const [activeError, setActiveError] = useState({ visible: false, message: '', type: 'error' });

    const testCases = [
        { code: 400, label: '400 - Bad Request' },
        { code: 401, label: '401 - Unauthorized' },
        { code: 403, label: '403 - Forbidden' },
        { code: 404, label: '404 - Not Found' },
        { code: 409, label: '409 - Conflict' },
        { code: 422, label: '422 - Unprocessable' },
        { code: 429, label: '429 - Too Many Requests' },
        { code: 500, label: '500 - Server Error' },
        { code: 503, label: '503 - Service Unavailable' },
    ];

    const handleTestError = (code) => {
        const mockError = { statusCode: code };
        const errorInfo = getErrorMessage(mockError);
        setActiveError({
            visible: true,
            message: errorInfo.message,
            type: errorInfo.type
        });
    };

    const showCustomError = (message, type) => {
        setActiveError({
            visible: true,
            message,
            type
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ErrorMessage Demo</Text>
                <Text style={styles.subtitle}>Teste os diferentes tipos de erro</Text>
            </View>

            <ErrorMessage
                visible={activeError.visible}
                message={activeError.message}
                type={activeError.type}
                onDismiss={() => setActiveError({ ...activeError, visible: false })}
                autoDismiss={5000}
            />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📡 Códigos HTTP</Text>
                <Text style={styles.sectionSubtitle}>
                    Clique para testar as mensagens automáticas
                </Text>
                
                {testCases.map((testCase) => (
                    <TouchableOpacity
                        key={testCase.code}
                        style={styles.testButton}
                        onPress={() => handleTestError(testCase.code)}
                    >
                        <Text style={styles.testButtonText}>{testCase.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎨 Tipos Customizados</Text>
                <Text style={styles.sectionSubtitle}>
                    Teste mensagens personalizadas
                </Text>

                <TouchableOpacity
                    style={[styles.testButton, styles.errorButton]}
                    onPress={() => showCustomError('Erro crítico no sistema!', 'error')}
                >
                    <Text style={styles.testButtonText}>🔴 Error</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.testButton, styles.warningButton]}
                    onPress={() => showCustomError('Atenção: Validação necessária', 'warning')}
                >
                    <Text style={styles.testButtonText}>🟡 Warning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.testButton, styles.infoButton]}
                    onPress={() => showCustomError('Informação: Dados atualizados', 'info')}
                >
                    <Text style={styles.testButtonText}>🔵 Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.testButton, styles.successButton]}
                    onPress={() => showCustomError('Operação realizada com sucesso!', 'success')}
                >
                    <Text style={styles.testButtonText}>🟢 Success</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
                
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                        setActiveError({
                            visible: true,
                            message: 'Esta mensagem fecha em 3 segundos',
                            type: 'info'
                        });
                    }}
                >
                    <Text style={styles.testButtonText}>⏱️ Auto-dismiss (3s)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                        setActiveError({
                            visible: true,
                            message: 'Esta mensagem tem texto muito longo para demonstrar como o componente se comporta com múltiplas linhas de texto e truncamento automático após 3 linhas.',
                            type: 'warning'
                        });
                    }}
                >
                    <Text style={styles.testButtonText}>📝 Texto Longo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Veja docs/ERROR_MESSAGE_USAGE.md para mais informações
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: moderateScale(20),
        backgroundColor: '#667eea',
        alignItems: 'center',
    },
    title: {
        fontSize: theme.fonts.h1,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: moderateScale(8),
    },
    subtitle: {
        fontSize: theme.fonts.body,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    section: {
        margin: moderateScale(16),
        padding: moderateScale(16),
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: theme.fonts.h3,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: moderateScale(4),
    },
    sectionSubtitle: {
        fontSize: theme.fonts.caption,
        color: '#666',
        marginBottom: moderateScale(16),
    },
    testButton: {
        padding: moderateScale(14),
        backgroundColor: '#667eea',
        borderRadius: moderateScale(8),
        marginBottom: moderateScale(8),
    },
    testButtonText: {
        color: '#fff',
        fontSize: theme.fonts.body,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorButton: {
        backgroundColor: '#DC2626',
    },
    warningButton: {
        backgroundColor: '#F59E0B',
    },
    infoButton: {
        backgroundColor: '#3B82F6',
    },
    successButton: {
        backgroundColor: '#10B981',
    },
    footer: {
        padding: moderateScale(20),
        alignItems: 'center',
    },
    footerText: {
        fontSize: theme.fonts.caption,
        color: '#999',
        textAlign: 'center',
    },
});
