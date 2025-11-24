import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/responsive';
import { theme } from '../../utils/theme';

export const ChangeNameModal = ({ visible, onClose, onSubmit, currentName }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setName(currentName || '');
        }
    }, [visible, currentName]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu nome');
            return;
        }

        if (name.trim() === currentName) {
            Alert.alert('Aviso', 'O nome não foi alterado');
            return;
        }

        try {
            setLoading(true);
            await onSubmit(name.trim());
            Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
            handleClose();
        } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível atualizar o nome');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setLoading(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.header}
                    >
                        <Ionicons name="person" size={moderateScale(32)} color="#fff" />
                        <Text style={styles.title}>Alterar Nome</Text>
                    </LinearGradient>

                    {/* Body */}
                    <View style={styles.body}>
                        <Text style={styles.label}>Novo Nome <Text style={styles.requiredAsterisk}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome completo"
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                            autoCapitalize="words"
                            editable={!loading}
                        />

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        padding: moderateScale(24),
        alignItems: 'center',
        gap: moderateScale(12),
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#fff',
    },
    body: {
        padding: moderateScale(24),
        gap: moderateScale(16),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: moderateScale(8),
    },
    requiredAsterisk: {
        color: theme.colors.danger,
        fontWeight: '700',
        marginLeft: moderateScale(4),
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        fontSize: moderateScale(16),
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginTop: moderateScale(8),
    },
    button: {
        flex: 1,
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#667eea',
    },
    submitButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
