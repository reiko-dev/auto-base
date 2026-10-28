import { describe, expect, it } from 'vitest';
import { profile } from '../config/profile';
import { buildVCard } from './vcard';

describe('vCard', () => {
  it('gera o contato da loja', () => {
    const card = buildVCard(profile, 'https://exemplo.com/auto-base/');
    expect(card.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
    expect(card).toContain('FN:Auto Base');
    expect(card).toContain('TEL;TYPE=CELL:+5568992194592');
    // vírgula escapada conforme o padrão
    expect(card).toContain('ADR;TYPE=WORK:;;Rua Floriano Peixoto\\, 293 - Base;Rio Branco;AC;;Brasil');
    expect(card).toContain('URL:https://exemplo.com/auto-base/');
    expect(card.endsWith('END:VCARD\r\n')).toBe(true);
  });
});
