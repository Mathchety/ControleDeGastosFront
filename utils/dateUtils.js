// Helper de datas para usar o fuso horário de Brasília (America/Sao_Paulo)
// Exporta funções para formatar datas no formato YYYY-MM-DD respeitando o timezone

export function formatDateToBrazil(dateInput) {
  const date = dateInput
    ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput)
    : new Date();

  try {
    // 'en-CA' geralmente formata como YYYY-MM-DD, som combinado com timeZone garante a data local de SP
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date);
  } catch (e) {
    // Fallback manual usando conversão via toLocaleString para timezone e extração
    const local = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const d = String(local.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function formatDateToBrazilReadable(dateInput, options = {}) {
  const date = dateInput
    ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput)
    : new Date();

  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', ...options });
}

// Converte uma string 'YYYY-MM-DD' para um Date no timezone local (evita interpretação como UTC)
export function parseYYYYMMDDToDate(str) {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  // Aceita strings no formato 'YYYY-MM-DD'
  const parts = String(str).split('-');
  if (parts.length !== 3) return new Date(str);
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d);
}
