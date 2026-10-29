import { describe, expect, it } from 'vitest';
import { profile } from '../config/profile';
import { directionsUrl, fullAddress, reviewUrl } from './links';

describe('links do Google', () => {
  it('avaliação abre a janela de review da ficha da loja', () => {
    expect(reviewUrl(profile.location!.googlePlaceId!)).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJoQyd72CNf5ER_YQ6W_ScLpI',
    );
  });

  it('rota usa o endereço e o Place ID', () => {
    const url = new URL(directionsUrl(fullAddress(profile.location!), profile.location!.googlePlaceId));
    expect(url.searchParams.get('destination')).toBe('Rua Floriano Peixoto, 293 - Base, Rio Branco - AC');
    expect(url.searchParams.get('destination_place_id')).toBe('ChIJoQyd72CNf5ER_YQ6W_ScLpI');
  });
});
