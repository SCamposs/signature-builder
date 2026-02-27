/**
 * Utilitários de máscaras e formatação de entrada
 */

/**
 * Aplica máscara de telefone brasileiro: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 */
export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Valida formato de telefone brasileiro
 */
export function isValidPhone(value: string): boolean {
  if (!value.trim()) {
    return true; // Campo opcional
  }

  const digits = value.replace(/\D/g, "");

  // 10 dígitos (fixo) ou 11 dígitos (celular)
  if (digits.length !== 10 && digits.length !== 11) {
    return false;
  }

  // DDD válido (10-99)
  const ddd = parseInt(digits.slice(0, 2));
  if (ddd < 10 || ddd > 99) {
    return false;
  }

  return true;
}

/**
 * Valida formato de e-mail
 */
export function isValidEmail(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  // RFC 5322 simplificado
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Valida URL
 */
export function isValidUrl(value: string): boolean {
  if (!value.trim()) {
    return true; // Campo opcional
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normaliza URL adicionando https:// se necessário
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
