import type { Profile } from './types.ts';

/**
 * Dados da Auto Base. Este é o único arquivo que muda de um cliente para outro
 * (além das imagens em public/). Campo opcional vazio = bloco não aparece.
 */
export const profile: Profile = {
  slug: 'auto-base',
  name: 'Auto Base',
  category: 'Lavagem automotiva',
  tagline: 'Posto de lavagem detalhada & conveniência',
  schemaType: 'AutoWash',
  siteUrl: 'https://reiko-dev.github.io/auto-base/',

  images: {
    cover: 'capa.webp',
    coverAlt: 'Auto Base — Lavagem Automotiva',
    og: 'og.jpg',
    favicon: 'favicon.png',
    appleTouchIcon: 'apple-touch-icon.png',
  },

  theme: {
    accent: '#12E3F5',
    onAccent: '#03123A',
    brand: '#0B3FB8',
    background: '#020B22',
  },

  timezone: 'America/Rio_Branco',

  contact: {
    whatsapp: '5568992194592',
    whatsappMessage: 'Olá! Vim pelo cartão digital da Auto Base e gostaria de mais informações.',
    phone: '5568992194592',
    instagram: 'autobase.ac',
  },

  location: {
    street: 'Rua Floriano Peixoto, 293',
    district: 'Base',
    city: 'Rio Branco',
    state: 'AC',
    // Ficha no Google Maps: "Lava jato e conveniência da base" (mesmo endereço e telefone).
    // Habilita o botão "Avaliar no Google" e deixa "Como chegar" apontando para o local exato.
    googlePlaceId: 'ChIJoQyd72CNf5ER_YQ6W_ScLpI',
  },

  hours: {
    schedule: [{ days: [0, 1, 2, 3, 4, 5], open: '07:40', close: '18:00' }],
    // TODO: horário de sábado não informado pelo cliente.
    notes: { 6: 'Consulte pelo WhatsApp' },
  },

  pix: {
    keyType: 'cnpj',
    key: '45038694000194',
    receiverName: 'HARISSON MATOS DE SANTANA',
    city: 'RIO BRANCO',
    code: '00020101021126360014br.gov.bcb.pix0114450386940001945204000053039865802BR5925HARISSON MATOS DE SANTANA6010RIO BRANCO62070503***63044CDA',
  },

  company: {
    cnpj: '45038694000194',
  },

  // TODO: tabela de preços — aguardando os valores do cliente.
  services: [],

  links: [],

  credit: { label: 'AKRY Solutions', url: 'http://www.akrysolutions.com.br/' },
};
