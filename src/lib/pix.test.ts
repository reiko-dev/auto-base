import { describe, expect, it } from 'vitest';
import { profile } from '../config/profile';
import { buildStaticPix, crc16, formatPixKey, isValidPix, normalizeKey, parsePix, resolvePixCode } from './pix';

const AUTO_BASE_CODE =
  '00020101021126360014br.gov.bcb.pix0114450386940001945204000053039865802BR5925HARISSON MATOS DE SANTANA6010RIO BRANCO62070503***63044CDA';

describe('crc16', () => {
  it('confere com o exemplo do manual do BR Code', () => {
    const payload =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
    expect(crc16(payload)).toBe('1D3D');
  });
});

describe('BR Code da Auto Base', () => {
  it('tem CRC válido', () => {
    expect(isValidPix(AUTO_BASE_CODE)).toBe(true);
    expect(isValidPix(AUTO_BASE_CODE.slice(0, -1) + 'B')).toBe(false);
  });

  it('é reproduzido exatamente a partir dos campos', () => {
    expect(
      buildStaticPix({ keyType: 'cnpj', key: '45.038.694/0001-94', receiverName: 'Harisson Matos de Santana'.toUpperCase(), city: 'Rio Branco'.toUpperCase() }),
    ).toBe(AUTO_BASE_CODE);
  });

  it('expõe recebedor, chave e cidade', () => {
    expect(parsePix(AUTO_BASE_CODE)).toEqual({
      key: '45038694000194',
      receiverName: 'HARISSON MATOS DE SANTANA',
      city: 'RIO BRANCO',
      amount: undefined,
      txid: '***',
    });
  });
});

describe('perfil', () => {
  it('tem um código Pix válido que bate com os campos declarados', () => {
    const pix = profile.pix!;
    const parsed = parsePix(resolvePixCode(pix));
    expect(parsed.key).toBe(normalizeKey(pix.keyType, pix.key));
    expect(parsed.receiverName).toBe(pix.receiverName);
    expect(parsed.city).toBe(pix.city);
    expect(parsed.amount).toBeUndefined();
  });
});

describe('normalização', () => {
  it('limita nome e cidade e remove acentos', () => {
    const code = buildStaticPix({ keyType: 'email', key: ' Loja@Exemplo.com ', receiverName: 'José da Conceição Açaí e Cia Ltda', city: 'São João do Meriti' });
    const parsed = parsePix(code);
    expect(parsed.key).toBe('loja@exemplo.com');
    expect(parsed.receiverName).toBe('Jose da Conceicao Acai e');
    expect(parsed.receiverName.length).toBeLessThanOrEqual(25);
    expect(parsed.city).toBe('Sao Joao do Mer');
  });

  it('formata a chave para exibição', () => {
    expect(formatPixKey('cnpj', '45038694000194')).toBe('45.038.694/0001-94');
    expect(formatPixKey('cpf', '12345678901')).toBe('***.456.789-**');
    expect(normalizeKey('phone', '(68) 99219-4592')).toBe('+5568992194592');
  });
});
