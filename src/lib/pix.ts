/**
 * BR Code (Pix Copia e Cola) estático: geração, leitura e validação.
 * Formato TLV do padrão EMV: ID (2 dígitos) + tamanho (2 dígitos) + valor.
 */
import type { PixKeyType } from '../config/types.ts';

const PIX_GUI = 'br.gov.bcb.pix';

/** CRC16-CCITT-FALSE: polinômio 0x1021, valor inicial 0xFFFF. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id: string, value: string): string {
  if (value.length > 99) throw new Error(`Campo ${id} excede 99 caracteres`);
  return id + String(value.length).padStart(2, '0') + value;
}

/** Remove acentos e caracteres fora do ASCII imprimível, como o BC recomenda. */
export function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, max)
    .trim();
}

export function normalizeKey(type: PixKeyType, key: string): string {
  switch (type) {
    case 'cpf':
    case 'cnpj':
      return key.replace(/\D/g, '');
    case 'phone': {
      const digits = key.replace(/\D/g, '');
      return '+' + (digits.startsWith('55') ? digits : '55' + digits);
    }
    case 'email':
      return key.trim().toLowerCase();
    case 'evp':
      return key.trim();
  }
}

export interface StaticPixInput {
  keyType: PixKeyType;
  key: string;
  receiverName: string;
  city: string;
  /** Valor fixo em reais. Omitido = o pagador digita o valor no banco. */
  amount?: number;
}

export function buildStaticPix(input: StaticPixInput): string {
  const merchantAccount = tlv('00', PIX_GUI) + tlv('01', normalizeKey(input.keyType, input.key));
  const payload =
    tlv('00', '01') +
    tlv('01', '11') + // 11 = QR estático
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (input.amount ? tlv('54', input.amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', sanitize(input.receiverName, 25)) +
    tlv('60', sanitize(input.city, 15)) +
    tlv('62', tlv('05', '***')) +
    '6304';
  return payload + crc16(payload);
}

export interface ParsedPix {
  key: string;
  receiverName: string;
  city: string;
  amount?: string;
  txid?: string;
}

function readTlv(data: string): Map<string, string> {
  const fields = new Map<string, string>();
  let i = 0;
  while (i < data.length) {
    const id = data.slice(i, i + 2);
    const len = Number(data.slice(i + 2, i + 4));
    if (id.length < 2 || Number.isNaN(len)) throw new Error('BR Code malformado');
    const value = data.slice(i + 4, i + 4 + len);
    if (value.length !== len) throw new Error('BR Code truncado');
    fields.set(id, value);
    i += 4 + len;
  }
  return fields;
}

export function isValidPix(code: string): boolean {
  if (!/6304[0-9A-F]{4}$/i.test(code)) return false;
  return crc16(code.slice(0, -4)) === code.slice(-4).toUpperCase();
}

export function parsePix(code: string): ParsedPix {
  if (!isValidPix(code)) throw new Error('Código Pix inválido (CRC não confere)');
  const fields = readTlv(code);
  const account = readTlv(fields.get('26') ?? '');
  if (account.get('00')?.toLowerCase() !== PIX_GUI) throw new Error('Código não é Pix');
  const extra = fields.get('62');
  return {
    key: account.get('01') ?? '',
    receiverName: fields.get('59') ?? '',
    city: fields.get('60') ?? '',
    amount: fields.get('54'),
    txid: extra ? readTlv(extra).get('05') : undefined,
  };
}

/** Usa o código do banco quando existir; senão gera a partir dos campos. */
export function resolvePixCode(pix: StaticPixInput & { code?: string }): string {
  const code = pix.code?.trim() || buildStaticPix(pix);
  if (!isValidPix(code)) throw new Error('Código Pix do perfil inválido (CRC não confere)');
  return code;
}

export function formatPixKey(type: PixKeyType, key: string): string {
  const d = key.replace(/\D/g, '');
  if (type === 'cnpj' && d.length === 14)
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  // CPF aparece mascarado, como os bancos fazem.
  if (type === 'cpf' && d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  if (type === 'phone') return formatPhone(d);
  return key;
}

export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return digits;
}
