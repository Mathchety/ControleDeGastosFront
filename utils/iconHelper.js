/**
 * Valida e retorna um ícone válido do Ionicons
 * Remove emojis e caracteres inválidos, retornando um ícone padrão se necessário
 * 
 * @param {string} iconName - Nome do ícone a ser validado
 * @param {string} defaultIcon - Ícone padrão caso o fornecido seja inválido (default: 'pricetag')
 * @returns {string} - Nome válido do ícone do Ionicons
 */
export const getValidIcon = (iconName, defaultIcon = 'pricetag') => {
    // Se não tem ícone, retorna o padrão
    if (!iconName) {
        return defaultIcon;
    }

    // Remove espaços em branco
    const trimmedIcon = String(iconName).trim();

    // Se é um emoji (contém caracteres Unicode de emoji), usa o padrão
    if (/[\u{1F300}-\u{1F9FF}]/u.test(trimmedIcon)) {
        return defaultIcon;
    }

    // Se é muito longo (provavelmente não é um nome de ícone válido), usa o padrão
    if (trimmedIcon.length > 50) {
        return defaultIcon;
    }

    // Se contém apenas letras, números e hífens (formato válido do Ionicons), retorna
    if (/^[a-z0-9-]+$/i.test(trimmedIcon)) {
        return trimmedIcon;
    }

    // Caso contrário, retorna o padrão
    return defaultIcon;
};

/**
 * Mapeamento de categorias comuns para ícones do Ionicons
 */
export const CATEGORY_ICON_MAP = {
    'Alimentação': 'restaurant',
    'Transporte': 'car',
    'Saúde': 'medkit',
    'Educação': 'school',
    'Lazer': 'game-controller',
    'Casa': 'home',
    'Roupas': 'shirt',
    'Tecnologia': 'laptop',
    'Pets': 'paw',
    'Outros': 'ellipsis-horizontal',
    'Não categorizado': 'help-circle',
};

/**
 * Obtém um ícone sugerido baseado no nome da categoria
 * 
 * @param {string} categoryName - Nome da categoria
 * @returns {string} - Ícone sugerido do Ionicons
 */
export const getSuggestedIcon = (categoryName) => {
    if (!categoryName) return 'pricetag';
    
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Procura correspondência exata
    for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
        if (key.toLowerCase() === normalizedName) {
            return icon;
        }
    }
    
    // Procura correspondência parcial
    for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
        if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
            return icon;
        }
    }
    
    return 'pricetag';
};
