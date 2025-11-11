import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { moderateScale } from '../../utils/responsive';

/**
 * Componente de skeleton loading com animação shimmer
 * @param {Object} props
 * @param {Number} props.width - Largura do skeleton (default: '100%')
 * @param {Number} props.height - Altura do skeleton (default: 20)
 * @param {Number} props.borderRadius - Raio da borda (default: 8)
 * @param {String} props.style - Estilos adicionais
 */
export const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 0.3],
    });

    return (
        <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                        opacity,
                    },
                ]}
            />
        </View>
    );
};

/**
 * Card skeleton para listas de receipts
 */
export const SkeletonReceiptCard = () => (
    <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
            <SkeletonLoader width={50} height={50} borderRadius={25} />
            <View style={styles.receiptInfo}>
                <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="50%" height={14} />
            </View>
        </View>
        <View style={styles.receiptFooter}>
            <SkeletonLoader width="40%" height={14} />
            <SkeletonLoader width="30%" height={16} />
        </View>
    </View>
);

/**
 * Card skeleton para categorias
 */
export const SkeletonCategoryCard = () => (
    <View style={styles.categoryCard}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.categoryInfo}>
            <SkeletonLoader width="60%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="80%" height={20} />
        </View>
    </View>
);

/**
 * Skeleton para cards de estatísticas
 */
export const SkeletonStatCard = () => (
    <View style={styles.statCard}>
        <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="80%" height={24} />
    </View>
);

/**
 * Skeleton para preview de nota fiscal
 */
export const SkeletonPreviewScreen = () => (
    <View style={styles.previewContainer}>
        {/* Header skeleton */}
        <View style={styles.previewHeader}>
            <SkeletonLoader width="70%" height={24} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="50%" height={16} />
        </View>
        
        {/* Summary skeleton */}
        <View style={styles.summaryCard}>
            <SkeletonLoader width="100%" height={60} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={60} />
        </View>
        
        {/* Items skeleton */}
        {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <SkeletonLoader width="60%" height={16} />
                    <SkeletonLoader width="25%" height={16} />
                </View>
                <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    
    // Receipt Card Skeleton
    receiptCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    receiptHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    receiptInfo: {
        flex: 1,
        marginLeft: moderateScale(12),
    },
    receiptFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    
    // Category Card Skeleton
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    categoryInfo: {
        flex: 1,
        marginLeft: moderateScale(12),
    },
    
    // Stat Card Skeleton
    statCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        flex: 1,
        alignItems: 'center',
        marginHorizontal: moderateScale(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    
    // Preview Screen Skeleton
    previewContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: moderateScale(20),
    },
    previewHeader: {
        marginBottom: moderateScale(20),
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(15),
        padding: moderateScale(16),
        marginBottom: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
