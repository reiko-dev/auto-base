import type { Profile } from '../config/types';

/** Escapa valores conforme o vCard 3.0 (RFC 2426). */
const esc = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export function buildVCard(profile: Profile, siteUrl: string): string {
  const { contact, location } = profile;
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:;${esc(profile.name)};;;`, `FN:${esc(profile.name)}`, `ORG:${esc(profile.name)}`];

  if (contact.phone || contact.whatsapp) lines.push(`TEL;TYPE=CELL:+${(contact.phone || contact.whatsapp)!.replace(/\D/g, '')}`);
  if (contact.email) lines.push(`EMAIL;TYPE=WORK:${esc(contact.email)}`);
  if (location) {
    const street = location.district ? `${location.street} - ${location.district}` : location.street;
    lines.push(
      `ADR;TYPE=WORK:;;${esc(street)};${esc(location.city)};${esc(location.state)};${esc(location.postalCode ?? '')};Brasil`,
    );
  }
  lines.push(`URL:${siteUrl}`);
  if (contact.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${contact.instagram}`);
  lines.push(`NOTE:${esc(profile.category)}`, 'END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

export function downloadVCard(profile: Profile, siteUrl: string): void {
  const blob = new Blob([buildVCard(profile, siteUrl)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.slug}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
