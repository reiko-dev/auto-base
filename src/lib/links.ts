import type { Profile } from '../config/types.ts';

const enc = encodeURIComponent;

export function fullAddress(location: NonNullable<Profile['location']>): string {
  const street = location.district ? `${location.street} - ${location.district}` : location.street;
  const cep = location.postalCode ? `, ${location.postalCode}` : '';
  return `${street}, ${location.city} - ${location.state}${cep}`;
}

export const whatsappUrl = (number: string, message?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${enc(message)}` : ''}`;

export const telUrl = (number: string) => `tel:+${number.replace(/\D/g, '')}`;

export const instagramUrl = (user: string) => `https://instagram.com/${user.replace(/^@/, '')}`;

export const mapsSearchUrl = (address: string, placeId?: string) =>
  `https://www.google.com/maps/search/?api=1&query=${enc(address)}${placeId ? `&query_place_id=${enc(placeId)}` : ''}`;

export const directionsUrl = (address: string, placeId?: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${enc(address)}${placeId ? `&destination_place_id=${enc(placeId)}` : ''}`;

export const reviewUrl = (placeId: string) => `https://search.google.com/local/writereview?placeid=${enc(placeId)}`;

/** URL pública do site: a do deploy (VITE_SITE_URL) ou a do perfil. Sempre com barra no fim. */
export function resolveSiteUrl(fallback: string, fromEnv?: string): string {
  const url = (fromEnv || fallback).trim();
  return url.endsWith('/') ? url : url + '/';
}
