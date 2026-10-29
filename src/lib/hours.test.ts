import { describe, expect, it } from 'vitest';
import { profile } from '../config/profile';
import type { Weekday } from '../config/types';
import { describeDay, formatTime, getOpenStatus, summarizeWeek } from './hours';

const tz = 'America/Rio_Branco'; // UTC-5, sem horário de verão
const hours = profile.hours!;
const at = (iso: string) => new Date(iso);

describe('getOpenStatus (Auto Base: dom–sex 7h40–18h, sábado a confirmar)', () => {
  it('quarta 12h → aberto', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-28T12:00:00-05:00'))).toEqual({ state: 'open', label: 'Aberto agora · fecha às 18h' });
  });

  it('quarta 6h → abre hoje', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-28T06:00:00-05:00')).label).toBe('Fechado · abre hoje às 7h40');
  });

  it('quinta 18h30 → abre amanhã', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-29T18:30:00-05:00')).label).toBe('Fechado · abre amanhã às 7h40');
  });

  it('sexta 19h → sábado sem horário definido', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-30T19:00:00-05:00')).label).toBe('Fechado agora · amanhã: consulte pelo WhatsApp');
  });

  it('sábado 10h → horário a confirmar', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-31T10:00:00-05:00'))).toEqual({ state: 'unknown', label: 'Hoje: consulte pelo WhatsApp' });
  });

  it('usa o fuso da loja, não o do visitante (23h UTC de quarta = 18h em Rio Branco)', () => {
    expect(getOpenStatus(hours, tz, at('2026-10-28T22:59:00Z')).state).toBe('open');
    expect(getOpenStatus(hours, tz, at('2026-10-28T23:00:00Z')).state).toBe('closed');
  });
});

describe('resumo da semana', () => {
  it('Auto Base: domingo a sexta + sábado', () => {
    expect(summarizeWeek(hours).map((g) => `${g.label}: ${g.value}`)).toEqual([
      'Domingo a sexta: 7h40 – 18h',
      'Sábado: Consulte pelo WhatsApp',
    ]);
  });

  it('comércio de segunda a sexta', () => {
    const weekdays = { schedule: [{ days: [1, 2, 3, 4, 5] as Weekday[], open: '08:00', close: '18:00' }] };
    expect(summarizeWeek(weekdays).map((g) => `${g.label}: ${g.value}`)).toEqual([
      'Segunda a sexta: 8h – 18h',
      'Sábado e domingo: Fechado',
    ]);
  });

  it('todos os dias', () => {
    const always = { schedule: [{ days: [0, 1, 2, 3, 4, 5, 6] as Weekday[], open: '06:00', close: '22:00' }] };
    expect(summarizeWeek(always).map((g) => `${g.label}: ${g.value}`)).toEqual(['Todos os dias: 6h – 22h']);
  });
});

describe('tabela semanal', () => {
  it('descreve os dias', () => {
    expect(describeDay(hours, 1)).toBe('7h40 – 18h');
    expect(describeDay(hours, 6)).toBe('Consulte pelo WhatsApp');
    expect(formatTime('09:05')).toBe('9h05');
  });
});
