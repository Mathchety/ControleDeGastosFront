# 🔄 API - Requisitos de Atualização de Item

## ❌ PROBLEMA ATUAL

Quando atualizamos um item da nota fiscal via `PATCH /item/{id}`, o backend retorna apenas o item atualizado, **mas NÃO recalcula os totais da nota fiscal**.

**Fluxo Atual:**
1. Frontend: `PATCH /item/123` com `{ quantity: 5, total: 25.00 }`
2. Backend: Atualiza item no banco
3. Backend: Retorna apenas o item atualizado `{ id: 123, quantity: 5, total: 25.00 }`
4. Frontend: Precisa fazer `GET /receipt/{id}` para pegar nota atualizada
5. ❌ **Dois requests para uma operação simples**

---

## ✅ SOLUÇÃO ESPERADA

O backend deveria **automaticamente recalcular os totais da nota** quando um item é atualizado.

### Endpoint: `PATCH /item/{id}`

**Request Body:**
```json
{
  "quantity": 5,
  "total": 25.00,
  "unitPrice": 5.00,
  "categoryId": 10
}
```

**Response (200 OK):**
```json
{
  "item": {
    "id": 123,
    "name": "Coca-Cola 2L",
    "quantity": 5,
    "total": 25.00,
    "unitPrice": 5.00,
    "categoryId": 10,
    "category": {
      "id": 10,
      "name": "Bebidas",
      "color": "#ff6b6b",
      "icon": "water"
    }
  },
  "receipt": {
    "id": 456,
    "subtotal": 150.50,
    "discount": 5.00,
    "total": 145.50,
    "itemsCount": 8
  }
}
```

### Lógica do Backend

```python
@router.patch("/item/{item_id}")
async def update_item(item_id: int, data: ItemUpdate):
    # 1. Atualiza o item
    item = await db.update_item(item_id, data)
    
    # 2. ✅ RECALCULA totais da nota fiscal
    receipt = await db.get_receipt_by_item(item_id)
    
    if receipt:
        # Soma todos os itens não deletados
        subtotal = sum(i.total for i in receipt.items if not i.deleted)
        total = subtotal - (receipt.discount or 0)
        items_count = len([i for i in receipt.items if not i.deleted])
        
        # Atualiza nota fiscal
        await db.update_receipt(receipt.id, {
            "subtotal": subtotal,
            "total": total,
            "itemsCount": items_count
        })
        
        # Retorna item E nota atualizada
        return {
            "item": item,
            "receipt": {
                "id": receipt.id,
                "subtotal": receipt.subtotal,
                "discount": receipt.discount,
                "total": receipt.total,
                "itemsCount": items_count
            }
        }
    
    # Se não encontrou nota, retorna só o item
    return {"item": item}
```

---

## 📊 COMPARAÇÃO

| Abordagem | Requests | Consistência | Performance |
|-----------|----------|--------------|-------------|
| **Atual (2 requests)** | `PATCH /item` + `GET /receipt` | ⚠️ Janela de inconsistência | ❌ Lento |
| **Nova (1 request)** | `PATCH /item` (retorna tudo) | ✅ Atômico | ✅ Rápido |

---

## 🔧 ALTERAÇÕES NO FRONTEND

**Arquivo**: `screens/PreViewScreen.js`

**Antes:**
```javascript
await updateItem(updatedItem.id, itemData);
// Precisa recarregar nota inteira
const updatedReceipt = await fetchReceiptById(receiptId);
```

**Depois (quando backend implementar):**
```javascript
const response = await updateItem(updatedItem.id, itemData);
// response já contém item E nota atualizada
setPreviewData(prev => ({
    ...prev,
    ...response.receipt,  // Totais atualizados
    items: prev.items.map(i => 
        i.id === response.item.id ? response.item : i
    )
}));
```

---

## 🎯 ENDPOINTS QUE PRECISAM RECALCULAR

### 1. `PATCH /item/{id}` ✅ Prioridade ALTA
- Atualizar quantidade, total, categoria
- Recalcular subtotal, total da nota

### 2. `DELETE /item/{id}` ✅ Prioridade ALTA
- Marcar item como deletado
- Recalcular totais (excluir do cálculo)

### 3. `POST /receipt/{id}/item` (se existir)
- Adicionar novo item à nota
- Recalcular totais

### 4. `PATCH /receipt/{id}` 
- Atualizar desconto da nota
- Recalcular total final

---

## 🧪 TESTES

### Teste 1: Atualizar quantidade
```bash
curl -X PATCH http://api/item/123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "total": 50.00,
    "unitPrice": 5.00
  }'
```

**Esperado:**
- ✅ Item atualizado
- ✅ Subtotal da nota recalculado
- ✅ Total da nota recalculado
- ✅ Resposta contém item E receipt

### Teste 2: Mudar categoria
```bash
curl -X PATCH http://api/item/123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 5
  }'
```

**Esperado:**
- ✅ Categoria do item atualizada
- ✅ Category object completo no response
- ✅ Totais não mudam (só categoria)

### Teste 3: Atualizar total
```bash
curl -X PATCH http://api/item/123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 99.90
  }'
```

**Esperado:**
- ✅ Total do item atualizado
- ✅ Subtotal da nota AUMENTA em (99.90 - total_antigo)
- ✅ Total da nota recalculado
- ✅ unitPrice recalculado automaticamente

---

## 📝 ESTRUTURA DE DADOS ESPERADA

### Item Completo
```typescript
interface Item {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  product?: {
    id: number;
    name: string;
  };
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Receipt Summary
```typescript
interface ReceiptSummary {
  id: number;
  subtotal: number;
  discount: number;
  total: number;
  itemsCount: number;
  storeName?: string;
  date?: string;
}
```

### Update Response
```typescript
interface ItemUpdateResponse {
  item: Item;
  receipt: ReceiptSummary;
}
```

---

## 🚀 BENEFÍCIOS

1. ✅ **Menos requests** - 1 ao invés de 2
2. ✅ **Mais rápido** - Resposta instantânea
3. ✅ **Consistente** - Operação atômica
4. ✅ **Menos dados** - Não precisa enviar nota inteira
5. ✅ **Melhor UX** - Interface atualiza instantaneamente

---

**Data**: 2025-11-13  
**Versão**: v1.0  
**Status**: ⏳ Aguardando implementação no backend
