import type { OpeningInterval, Weekday } from '../config/types.ts';

export const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;
export const DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
/** Ordem de exibição da semana (segunda primeiro). */
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const WEEKDAY_INDEX: Record<string, Weekday> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export interface Hours {
  schedule: OpeningInterval[];
  notes?: Partial<Record<Weekday, string>>;
}

export type OpenState = 'open' | 'closed' | 'unknown';

export interface OpenStatus {
  state: OpenState;
  label: string;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "07:40" → "7h40", "18:00" → "18h" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

/** Dia da semana e minutos do dia no fuso informado (não no fuso do visitante). */
export function zonedNow(date: Date, timeZone: string): { weekday: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { weekday: WEEKDAY_INDEX[get('weekday')], minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

export function intervalsFor(hours: Hours, day: Weekday): OpeningInterval[] {
  return hours.schedule.filter((i) => i.days.includes(day)).sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
}

export function getOpenStatus(hours: Hours, timeZone: string, now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = zonedNow(now, timeZone);
  const today = intervalsFor(hours, weekday);

  const current = today.find((i) => minutes >= toMinutes(i.open) && minutes < toMinutes(i.close));
  if (current) return { state: 'open', label: `Aberto agora · fecha às ${formatTime(current.close)}` };

  const todayNote = hours.notes?.[weekday];
  if (!today.length && todayNote) return { state: 'unknown', label: `Hoje: ${lowerFirst(todayNote)}` };

  const laterToday = today.find((i) => minutes < toMinutes(i.open));
  if (laterToday) return { state: 'closed', label: `Fechado · abre hoje às ${formatTime(laterToday.open)}` };

  for (let offset = 1; offset <= 7; offset++) {
    const day = ((weekday + offset) % 7) as Weekday;
    const when = offset === 1 ? 'amanhã' : DAY_NAMES[day];
    const next = intervalsFor(hours, day)[0];
    if (next) return { state: 'closed', label: `Fechado · abre ${when} às ${formatTime(next.open)}` };
    const note = hours.notes?.[day];
    if (note) return { state: 'closed', label: `Fechado agora · ${when}: ${lowerFirst(note)}` };
  }
  return { state: 'closed', label: 'Fechado' };
}

/** Texto de um dia na tabela semanal. */
export function describeDay(hours: Hours, day: Weekday): string {
  const list = intervalsFor(hours, day);
  if (list.length) return list.map((i) => `${formatTime(i.open)} – ${formatTime(i.close)}`).join(' · ');
  return hours.notes?.[day] ?? 'Fechado';
}

export interface WeekGroup {
  days: Weekday[];
  /** Ex.: "Domingo a sexta", "Sábado e domingo", "Todos os dias" */
  label: string;
  value: string;
}

/**
 * Junta dias seguidos com o mesmo horário ("Domingo a sexta: 7h40 – 18h").
 * Testa a semana começando no domingo e na segunda e fica com a que gera menos linhas.
 */
export function summarizeWeek(hours: Hours): WeekGroup[] {
  const group = (order: Weekday[]) => {
    const groups: { days: Weekday[]; value: string }[] = [];
    for (const day of order) {
      const value = describeDay(hours, day);
      const last = groups[groups.length - 1];
      if (last && last.value === value) last.days.push(day);
      else groups.push({ days: [day], value });
    }
    return groups;
  };
  const mondayFirst = group(WEEK_ORDER);
  const sundayFirst = group([0, 1, 2, 3, 4, 5, 6]);
  const best = sundayFirst.length < mondayFirst.length ? sundayFirst : mondayFirst;
  return best.map((g) => ({ ...g, label: rangeLabel(g.days) }));
}

function rangeLabel(days: Weekday[]): string {
  if (days.length === 7) return 'Todos os dias';
  const first = DAY_LABELS[days[0]];
  if (days.length === 1) return first;
  const last = DAY_NAMES[days[days.length - 1]];
  return days.length === 2 ? `${first} e ${last}` : `${first} a ${last}`;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
