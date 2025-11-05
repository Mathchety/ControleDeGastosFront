import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Paleta de cores para as categorias
const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#fed6e3', '#c471f5', '#12c2e9',
    '#f857a6', '#ff9a9e', '#fbc2eb', '#a6c1ee'
];

/**
 * Componente de gráfico de pizza para categorias
 * @param {Array} categories - Lista de categorias com { id, name, total, itemCount }
 */
export default function PieChartCategories({ categories }) {
    if (!categories || categories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma categoria com valores</Text>
            </View>
        );
    }

    // Prepara dados para o gráfico
    const chartData = categories
        .sort((a, b) => parseFloat(b.total || 0) - parseFloat(a.total || 0)) // Ordena por valor decrescente
        .map((category, index) => ({
            name: category.name,
            total: parseFloat(category.total || 0),
            color: COLORS[index % COLORS.length],
            legendFontColor: '#333',
            legendFontSize: 12,
        }));

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gastos por Categoria</Text>
            
            <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="total"
                backgroundColor="transparent"
                paddingLeft="70"
                absolute
                hasLegend={false}
            />

            {/* Lista de valores */}
            <View style={styles.valuesContainer}>
                {chartData.map((item, index) => (
                    <View key={index} style={styles.valueItem}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.valueName}>{item.name}</Text>
                        <Text style={styles.valueAmount}>R$ {item.total.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    valuesContainer: {
        marginTop: 20,
    },
    valueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    valueName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    valueAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
    },
});
