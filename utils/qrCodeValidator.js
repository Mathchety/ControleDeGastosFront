/**
 * 🗺️ Validação de QR Code de Notas Fiscais por Região
 * 
 * O app atualmente suporta apenas notas fiscais do Paraná (PR).
 * Este arquivo contém a lista de domínios oficiais de cada estado
 * e retorna mensagens apropriadas para QR codes não suportados.
 */

// 📍 Domínios oficiais das Secretarias de Fazenda por região
export const SEFAZ_DOMAINS = {
    // ✅ REGIÃO SUL (SUPORTADO)
    PR: [
        'fazenda.pr.gov.br',
        'sefaz.pr.gov.br',
        'nfce.fazenda.pr.gov.br',
        'nfe.fazenda.pr.gov.br',
    ],
    
    // ⏳ REGIÃO NORTE (FUTURO)
    AC: ['sefaz.ac.gov.br'],
    AP: ['sefaz.ap.gov.br'],
    AM: ['sefaz.am.gov.br'],
    PA: ['sefa.pa.gov.br'],
    RO: ['sefin.ro.gov.br'],
    RR: ['sefaz.rr.gov.br'],
    TO: ['sefaz.to.gov.br'],
    
    // ⏳ REGIÃO NORDESTE (FUTURO)
    AL: ['sefaz.al.gov.br'],
    BA: ['sefaz.ba.gov.br'],
    CE: ['sefaz.ce.gov.br'],
    MA: ['sistemas.sefaz.ma.gov.br', 'sefaz.ma.gov.br'],
    PB: ['sefaz.pb.gov.br'],
    PE: ['sefaz.pe.gov.br'],
    PI: ['sefaz.pi.gov.br'],
    RN: ['set.rn.gov.br'],
    SE: ['sefaz.se.gov.br'],
    
    // ⏳ REGIÃO CENTRO-OESTE (FUTURO)
    DF: ['receita.fazenda.df.gov.br'],
    GO: ['economia.go.gov.br', 'sefaz.go.gov.br'],
    MT: ['sefaz.mt.gov.br'],
    MS: ['sefaz.ms.gov.br'],
    
    // ⏳ REGIÃO SUDESTE (FUTURO)
    ES: ['sefaz.es.gov.br'],
    MG: ['fazenda.mg.gov.br'],
    RJ: ['portal.fazenda.rj.gov.br', 'fazenda.rj.gov.br'],
    SP: ['portal.fazenda.sp.gov.br', 'fazenda.sp.gov.br', 'nfe.fazenda.sp.gov.br'],
    
    // ⏳ REGIÃO SUL (OUTROS ESTADOS - FUTURO)
    RS: ['sefaz.rs.gov.br'],
    SC: ['sef.sc.gov.br'],
};

// 🏷️ Nomes dos estados por sigla
export const STATE_NAMES = {
    // Norte
    AC: 'Acre', AP: 'Amapá', AM: 'Amazonas', PA: 'Pará',
    RO: 'Rondônia', RR: 'Roraima', TO: 'Tocantins',
    
    // Nordeste
    AL: 'Alagoas', BA: 'Bahia', CE: 'Ceará', MA: 'Maranhão',
    PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí',
    RN: 'Rio Grande do Norte', SE: 'Sergipe',
    
    // Centro-Oeste
    DF: 'Distrito Federal', GO: 'Goiás',
    MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    
    // Sudeste
    ES: 'Espírito Santo', MG: 'Minas Gerais',
    RJ: 'Rio de Janeiro', SP: 'São Paulo',
    
    // Sul
    PR: 'Paraná', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
};

// 🗺️ Regiões geográficas
export const REGIONS = {
    NORTE: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    NORDESTE: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    CENTRO_OESTE: ['DF', 'GO', 'MT', 'MS'],
    SUDESTE: ['ES', 'MG', 'RJ', 'SP'],
    SUL: ['PR', 'RS', 'SC'],
};

// 🗺️ Nomes das regiões
export const REGION_NAMES = {
    NORTE: 'Norte',
    NORDESTE: 'Nordeste',
    CENTRO_OESTE: 'Centro-Oeste',
    SUDESTE: 'Sudeste',
    SUL: 'Sul',
};

/**
 * Extrai o domínio de uma URL
 * @param {string} url - URL completa
 * @returns {string} - Domínio extraído
 */
function extractDomain(url) {
    try {
        if (!url) return '';
        
        // Remove protocolo
        let domain = url.replace(/^https?:\/\//i, '');
        
        // Remove path e query string
        domain = domain.split('/')[0];
        domain = domain.split('?')[0];
        
        return domain.toLowerCase();
    } catch {
        return '';
    }
}

/**
 * Detecta o estado baseado no domínio do QR Code
 * @param {string} url - URL do QR Code
 * @returns {string|null} - Sigla do estado (ex: 'PR') ou null
 */
function detectState(url) {
    const domain = extractDomain(url);
    
    for (const [state, domains] of Object.entries(SEFAZ_DOMAINS)) {
        for (const sefazDomain of domains) {
            if (domain.includes(sefazDomain) || sefazDomain.includes(domain)) {
                return state;
            }
        }
    }
    
    return null;
}

/**
 * Detecta a região do estado
 * @param {string} state - Sigla do estado (ex: 'PR')
 * @returns {string|null} - Nome da região ou null
 */
function detectRegion(state) {
    for (const [regionKey, states] of Object.entries(REGIONS)) {
        if (states.includes(state)) {
            return REGION_NAMES[regionKey];
        }
    }
    return null;
}

/**
 * Valida se o QR Code é de uma nota fiscal suportada
 * @param {string} url - URL do QR Code escaneado
 * @returns {Object} - { valid: boolean, state: string, region: string, message: string }
 */
export function validateQRCode(url) {
    if (!url || typeof url !== 'string') {
        return {
            valid: false,
            state: null,
            region: null,
            message: 'QR Code inválido',
        };
    }
    
    const domain = extractDomain(url);
    const state = detectState(url);
    
    // ✅ CASO 1: Paraná (PR) - SUPORTADO
    if (state === 'PR') {
        return {
            valid: true,
            state: 'PR',
            region: 'Sul',
            message: 'QR Code válido!',
        };
    }
    
    // ⏳ CASO 2: Outro estado brasileiro - FUTURO
    if (state) {
        const region = detectRegion(state);
        const stateName = STATE_NAMES[state];
        
        return {
            valid: false,
            state,
            region,
            message: `Nota fiscal do estado de ${stateName} (${state}) - Região ${region}`,
            futureMessage: `Em breve adicionaremos suporte para notas fiscais do ${stateName}! 🚀`,
        };
    }
    
    // ❌ CASO 3: Não é SEFAZ/NF-e
    // Verifica se tem aparência de domínio SEFAZ
    const sefazKeywords = ['sefaz', 'fazenda', 'nfe', 'nfce', 'nfc-e', 'nota', 'fiscal'];
    const hasSefazKeyword = sefazKeywords.some(keyword => domain.includes(keyword));
    
    if (hasSefazKeyword) {
        // Parece SEFAZ mas não está na lista
        return {
            valid: false,
            state: null,
            region: null,
            message: 'Estado não identificado',
            futureMessage: 'Este QR Code parece ser de uma nota fiscal, mas ainda não suportamos este estado. Em breve! 🚀',
        };
    }
    
    // ❌ CASO 4: Não é nota fiscal
    return {
        valid: false,
        state: null,
        region: null,
        message: 'QR Code inválido',
        errorMessage: 'Este não é o QR Code de uma Nota Fiscal Eletrônica. Por favor, escaneie o QR Code impresso na nota fiscal.',
    };
}

/**
 * Verifica se o estado é suportado atualmente
 * @param {string} state - Sigla do estado (ex: 'PR')
 * @returns {boolean}
 */
export function isStateSupported(state) {
    return state === 'PR'; // Apenas PR por enquanto
}

/**
 * Retorna lista de estados suportados
 * @returns {Array<string>}
 */
export function getSupportedStates() {
    return ['PR'];
}

/**
 * Retorna mensagem personalizada para estado não suportado
 * @param {string} state - Sigla do estado
 * @returns {string}
 */
export function getUnsupportedStateMessage(state) {
    const stateName = STATE_NAMES[state];
    const region = detectRegion(state);
    
    if (!stateName) {
        return 'Estado não identificado. Atualmente suportamos apenas notas fiscais do Paraná (PR).';
    }
    
    return `Nota fiscal de ${stateName} (${state})\n\nEm breve adicionaremos suporte para notas fiscais da região ${region}! 🚀\n\nAtualmente processamos apenas notas do Paraná (PR).`;
}

/**
 * Exemplos de uso:
 * 
 * const result = validateQRCode('https://nfce.fazenda.pr.gov.br/qrcode?chNFe=...');
 * if (result.valid) {
 *     // Processar nota fiscal
 * } else {
 *     Alert.alert(result.message, result.futureMessage || result.errorMessage);
 * }
 */
