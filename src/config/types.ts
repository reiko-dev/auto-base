/** 0 = domingo, 1 = segunda … 6 = sábado */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningInterval {
  days: Weekday[];
  /** "HH:mm" no fuso do perfil */
  open: string;
  /** "HH:mm" no fuso do perfil */
  close: string;
}

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export interface Profile {
  /** Usado no nome do arquivo de contato (.vcf). */
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  /** Tipo schema.org do negócio (ex.: AutoWash, Restaurant). Padrão: LocalBusiness. */
  schemaType?: string;
  /**
   * URL pública final, com barra no fim. No deploy pelo GitHub Actions ela é
   * substituída automaticamente pela URL real do Pages (VITE_SITE_URL).
   */
  siteUrl: string;
  /** Caminhos relativos à pasta public/. */
  images: {
    cover?: string;
    coverAlt?: string;
    og: string;
    favicon: string;
    appleTouchIcon: string;
  };
  theme: {
    /** Cor de destaque (botão principal). */
    accent: string;
    /** Cor do texto sobre a cor de destaque. */
    onAccent: string;
    /** Cor secundária de botões (ex.: Pix). */
    brand: string;
    /** Fundo da página. */
    background: string;
  };
  /** Fuso IANA usado para calcular "aberto agora". */
  timezone: string;
  contact: {
    /** Somente dígitos, com 55 + DDD. Ex.: 5568999999999 */
    whatsapp?: string;
    whatsappMessage?: string;
    /** Somente dígitos, com 55 + DDD. */
    phone?: string;
    email?: string;
    /** Usuário sem @ */
    instagram?: string;
  };
  location?: {
    street: string;
    district?: string;
    city: string;
    state: string;
    postalCode?: string;
    /** Habilita o botão "Avaliar no Google". */
    googlePlaceId?: string;
  };
  hours?: {
    schedule: OpeningInterval[];
    /** Texto para dias sem horário definido. Ex.: { 6: 'Consulte pelo WhatsApp' } */
    notes?: Partial<Record<Weekday, string>>;
  };
  pix?: {
    keyType: PixKeyType;
    key: string;
    receiverName: string;
    city: string;
    /** Pix Copia e Cola gerado pelo banco. Se presente, tem prioridade sobre a geração. */
    code?: string;
  };
  company?: {
    legalName?: string;
    cnpj?: string;
  };
  /** Tabela de preços. Lista vazia = seção oculta. */
  services?: { name: string; price?: string; description?: string }[];
  /** Links extras (cardápio, catálogo, site…). */
  links?: { label: string; url: string }[];
  credit: { label: string; url: string };
}
