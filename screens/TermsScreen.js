import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import privacyText from '../docs/privacyText';
import { moderateScale } from '../utils/responsive';

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.title}>Termos e Política de Privacidade</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{privacyText}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: moderateScale(8),
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#333',
  },
  content: {
    padding: moderateScale(16),
  },
  body: {
    color: '#333',
    fontSize: moderateScale(14),
    lineHeight: 20,
  },
});
