import { AtSign, Clock, ExternalLink, FileText, MapPin, Phone, Store, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { profile } from '../config/profile';
import { summarizeWeek, zonedNow } from '../lib/hours';
import { fullAddress, instagramUrl, mapsSearchUrl, whatsappUrl } from '../lib/links';
import { formatPhone, formatPixKey } from '../lib/pix';

function Card({
  icon: Icon,
  title,
  watermark: Watermark,
  children,
}: {
  icon: LucideIcon;
  title: string;
  /** Ícone grande e apagado no canto, só decorativo. */
  watermark?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="card">
      {Watermark && (
        <Watermark aria-hidden strokeWidth={1.1} className="pointer-events-none absolute right-4 bottom-3 size-20 text-sky-300/10" />
      )}
      <h2 className="flex items-center gap-3 border-b border-sky-100/10 pb-3 font-display text-lg font-bold text-white">
        <Icon aria-hidden className="size-6 text-slate-200" strokeWidth={1.6} />
        {title}
      </h2>
      <div className="relative mt-3">{children}</div>
    </section>
  );
}

export function HoursCard() {
  const hours = profile.hours!;
  const today = zonedNow(new Date(), profile.timezone).weekday;
  return (
    <Card icon={Clock} title="Horário de funcionamento" watermark={Clock}>
      <dl className="grid gap-1.5 text-[15px]">
        {summarizeWeek(hours).map((group) => {
          const isToday = group.days.includes(today);
          return (
            <div key={group.label} className="flex flex-wrap gap-x-2">
              <dt className="text-slate-300">{group.label}:</dt>
              <dd className="font-semibold text-white tabular-nums">
                {group.value}
                {isToday && <span className="sr-only"> (hoje)</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

export function ServicesCard() {
  return (
    <Card icon={Tag} title="Serviços e preços">
      <ul className="divide-y divide-sky-100/10">
        {profile.services!.map((s) => (
          <li key={s.name} className="flex items-start justify-between gap-3 py-2.5">
            <span>
              <span className="block font-semibold text-white">{s.name}</span>
              {s.description && <span className="block text-sm text-slate-400">{s.description}</span>}
            </span>
            {s.price && <span className="shrink-0 font-bold text-accent tabular-nums">{s.price}</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function LinksCard() {
  return (
    <Card icon={ExternalLink} title="Links">
      <ul className="grid gap-2">
        {profile.links!.map((l) => (
          <li key={l.url}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button flex min-h-12 items-center justify-between rounded-xl px-4 font-semibold text-white"
            >
              {l.label}
              <ExternalLink aria-hidden className="size-4 text-slate-400" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, href, children }: { icon: LucideIcon; label: string; href?: string; children: ReactNode }) {
  const value = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="transition hover:text-accent">
      {children}
    </a>
  ) : (
    children
  );
  return (
    <div className="flex items-start gap-3.5 py-1.5">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.8} />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 text-[15px] leading-snug text-white">{value}</dd>
    </div>
  );
}

export function InfoCard() {
  const { location, contact, company } = profile;
  const address = location && fullAddress(location);
  return (
    <Card icon={Store} title="Dados da loja">
      <dl>
        {address && location && (
          <InfoRow icon={MapPin} label="Endereço" href={mapsSearchUrl(address, location?.googlePlaceId)}>
            {/* Quebra no ponto natural: rua e bairro / cidade e estado. */}
            <span className="block">{location.district ? `${location.street} - ${location.district},` : `${location.street},`}</span>
            <span className="block">
              {location.city} - {location.state}
              {location.postalCode && `, ${location.postalCode}`}
            </span>
          </InfoRow>
        )}
        {contact.whatsapp && (
          <InfoRow icon={Phone} label="WhatsApp" href={whatsappUrl(contact.whatsapp, contact.whatsappMessage)}>
            {formatPhone(contact.whatsapp)}
          </InfoRow>
        )}
        {contact.instagram && (
          <InfoRow icon={AtSign} label="Instagram" href={instagramUrl(contact.instagram)}>
            @{contact.instagram}
          </InfoRow>
        )}
        {contact.email && (
          <InfoRow icon={AtSign} label="E-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </InfoRow>
        )}
        {(company?.legalName || company?.cnpj) && (
          <InfoRow icon={FileText} label={company.legalName ? 'Razão social e CNPJ' : 'CNPJ'}>
            {company.legalName && <span className="block">{company.legalName}</span>}
            {company.cnpj && <span className="block tabular-nums">CNPJ {formatPixKey('cnpj', company.cnpj)}</span>}
          </InfoRow>
        )}
      </dl>
    </Card>
  );
}
