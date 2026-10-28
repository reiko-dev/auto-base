import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { profile } from './src/config/profile.ts';
import { DAY_NAMES } from './src/lib/hours.ts';
import { fullAddress, resolveSiteUrl, whatsappUrl } from './src/lib/links.ts';
import { formatPhone } from './src/lib/pix.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Escreve no index.html, em tempo de build, tudo que precisa existir sem JavaScript:
 * título, descrição, prévia de link (WhatsApp/Instagram não executam JS), ícones,
 * cores do tema e dados estruturados do negócio.
 */
function profileHead(): Plugin {
  let base = '/';
  return {
    name: 'profile-head',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml(html) {
      const site = resolveSiteUrl(profile.siteUrl, process.env.VITE_SITE_URL);
      const title = `${profile.name} · ${profile.category}`;
      const description = [profile.tagline, profile.location && `${profile.location.city} - ${profile.location.state}`]
        .filter(Boolean)
        .join(' · ');
      const ogImage = new URL(profile.images.og, site).href;
      const { theme, contact, location, hours } = profile;

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': profile.schemaType ?? 'LocalBusiness',
        name: profile.name,
        description,
        url: site,
        image: ogImage,
        ...(contact.phone && { telephone: `+${contact.phone}` }),
        ...(location && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: location.district ? `${location.street} - ${location.district}` : location.street,
            addressLocality: location.city,
            addressRegion: location.state,
            ...(location.postalCode && { postalCode: location.postalCode }),
            addressCountry: 'BR',
          },
        }),
        ...(hours && {
          openingHoursSpecification: hours.schedule.map((i) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: i.days.map((d) => SCHEMA_DAYS[d]),
            opens: i.open,
            closes: i.close,
          })),
        }),
        ...(contact.instagram && { sameAs: [`https://instagram.com/${contact.instagram}`] }),
      };

      const head = [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        `<meta name="theme-color" content="${esc(theme.background)}" />`,
        `<link rel="canonical" href="${esc(site)}" />`,
        `<link rel="icon" type="image/png" href="${base}${profile.images.favicon}" />`,
        `<link rel="apple-touch-icon" href="${base}${profile.images.appleTouchIcon}" />`,
        profile.images.cover && `<link rel="preload" as="image" href="${base}${profile.images.cover}" fetchpriority="high" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:locale" content="pt_BR" />`,
        `<meta property="og:site_name" content="${esc(profile.name)}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta property="og:url" content="${esc(site)}" />`,
        `<meta property="og:image" content="${esc(ogImage)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(profile.images.coverAlt ?? profile.name)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<style>:root{--accent:${theme.accent};--on-accent:${theme.onAccent};--brand:${theme.brand};--bg:${theme.background}}</style>`,
        `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
      ]
        .filter(Boolean)
        .join('\n    ');

      // Conteúdo mínimo para quem abrir sem JavaScript.
      const fallback = [
        `<h1>${esc(profile.name)}</h1>`,
        `<p>${esc(profile.category)}</p>`,
        contact.whatsapp &&
          `<p><a href="${esc(whatsappUrl(contact.whatsapp, contact.whatsappMessage))}">WhatsApp ${esc(formatPhone(contact.whatsapp))}</a></p>`,
        location && `<p>${esc(fullAddress(location))}</p>`,
        hours &&
          `<p>${esc(hours.schedule.map((i) => `${i.days.map((d) => DAY_NAMES[d]).join(', ')}: ${i.open}–${i.close}`).join('; '))}</p>`,
      ]
        .filter(Boolean)
        .join('');

      return html.replace('<!-- profile:head -->', head).replace('<!-- profile:noscript -->', `<noscript>${fallback}</noscript>`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), profileHead()],
});
