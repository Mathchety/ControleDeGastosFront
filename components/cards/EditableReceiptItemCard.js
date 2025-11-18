import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EditItemModal } from "../modals";
import { moderateScale } from "../../utils/responsive";

export default function EditableReceiptItemCard({
  item,
  itemIndex,
  onUpdate,
  onDelete,
  readOnly,
  categories = [],
  disableCategory = false,
  hideCategory = false,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const productName = item.product?.name || item.name || item.description || "";
  const categoryName = item.category?.name || item.categoryName || "";
  const unity = item.product?.unity || item.unit || "UN";
  const itemTotal = parseFloat(item.total || 0);
  const quantity = parseFloat(item.quantity || 1);
  const unitPrice = quantity > 0 ? itemTotal / quantity : 0;

  // ✨ Determina tipo de unidade e cores
  const getUnitInfo = () => {
    const unityLower = unity?.toLowerCase() || '';
    if (unityLower === 'l' || unityLower === 'litros') {
      return { type: 'litros', icon: '🧊', color: '#667eea', bgColor: '#e8f1ff' };
    }
    if (unityLower === 'kg' || unityLower === 'kilo' || unityLower === 'kilos' || unityLower === 'gramas' || unityLower === 'g') {
      return { type: 'peso', icon: '⚖️', color: '#ff6b6b', bgColor: '#ffe8e8' };
    }
    return { type: 'quantidade', icon: '📦', color: '#667eea', bgColor: '#e8f1ff' };
  };
  const unitInfo = getUnitInfo();
  //test

  if (item.deleted) return null;

  return (
    <>
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>#{itemIndex + 1}</Text>
          </View>
          <Text style={styles.itemName}>{productName}</Text>
          {!readOnly && (
            <TouchableOpacity
              style={styles.editItemButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="create-outline" size={20} color="#667eea" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.itemDetailRow}>
            <View style={[styles.unitIndicator, { backgroundColor: unitInfo.bgColor }]}>
              <Text style={styles.unitIndicatorText}>{unitInfo.icon}</Text>
            </View>
            <Text style={styles.itemDetailText}>
              {unitInfo.type === 'litros' ? 'Litros' : unitInfo.type === 'peso' ? 'Peso' : 'Quantidade'}: {quantity} {unity}
            </Text>
          </View>
          <View style={styles.itemDetailRow}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.itemDetailText}>
              Preço Unitário: R$ {unitPrice.toFixed(2)}
            </Text>
          </View>
          {categoryName && (
            <View style={styles.itemDetailRow}>
              <Ionicons name="folder-outline" size={16} color="#666" />
              <Text style={styles.itemDetailText}>{categoryName}</Text>
            </View>
          )}
        </View>
        <View style={styles.itemFooter}>
          <Text style={styles.itemTotalLabel}>Total</Text>
          <Text style={styles.itemTotalValue}>R$ {itemTotal.toFixed(2)}</Text>
        </View>
      </View>
      {!readOnly && (
        <EditItemModal
          visible={modalVisible}
          item={item}
          categories={categories}
          disableCategory={disableCategory}
          hideCategory={hideCategory}
          onSave={async (updatedItem) =>
            onUpdate && (await onUpdate(updatedItem, itemIndex))
          }
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(15),
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  itemBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    backgroundColor: "#667eea",
    marginRight: moderateScale(10),
  },
  itemBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#fff",
  },
  itemName: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#333",
  },
  editItemButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: moderateScale(8),
  },
  itemDetails: { marginBottom: moderateScale(12) },
  itemDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(6),
    gap: moderateScale(8),
  },
  unitIndicator: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  unitIndicatorText: {
    fontSize: moderateScale(16),
  },
  itemDetailText: {
    fontSize: moderateScale(14),
    color: "#666",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  itemTotalLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#666",
  },
  itemTotalValue: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#667eea",
  },
});
