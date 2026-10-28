import { AtSign, Clock, ExternalLink, MapPin, Phone, Store, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { profile } from '../config/profile';
import { DAY_LABELS, describeDay, WEEK_ORDER, zonedNow } from '../lib/hours';
import { fullAddress, instagramUrl, mapsSearchUrl, whatsappUrl } from '../lib/links';
import { formatPhone, formatPixKey } from '../lib/pix';

function Card({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <Icon aria-hidden className="size-5 text-accent" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function HoursCard() {
  const hours = profile.hours!;
  const today = zonedNow(new Date(), profile.timezone).weekday;
  return (
    <Card icon={Clock} title="Horário de funcionamento">
      <dl className="divide-y divide-white/5 text-[15px]">
        {WEEK_ORDER.map((day) => {
          const isToday = day === today;
          return (
            <div key={day} className={`flex justify-between gap-3 py-2 ${isToday ? 'font-bold text-white' : 'text-slate-300'}`}>
              <dt>
                {DAY_LABELS[day]}
                {isToday && <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">hoje</span>}
              </dt>
              <dd className="text-right tabular-nums">{describeDay(hours, day)}</dd>
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
      <ul className="divide-y divide-white/5">
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

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</dt>
        <dd className="text-[15px] text-white">{children}</dd>
      </div>
    </div>
  );
}

export function InfoCard() {
  const { location, contact, company } = profile;
  const address = location && fullAddress(location);
  const linkClass = 'underline decoration-white/30 underline-offset-4 hover:decoration-accent';
  return (
    <Card icon={Store} title="Dados da loja">
      <dl className="divide-y divide-white/5">
        {address && (
          <InfoRow icon={MapPin} label="Endereço">
            <a href={mapsSearchUrl(address, location?.googlePlaceId)} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {address}
            </a>
          </InfoRow>
        )}
        {contact.whatsapp && (
          <InfoRow icon={Phone} label="WhatsApp">
            <a href={whatsappUrl(contact.whatsapp, contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {formatPhone(contact.whatsapp)}
            </a>
          </InfoRow>
        )}
        {contact.instagram && (
          <InfoRow icon={AtSign} label="Instagram">
            <a href={instagramUrl(contact.instagram)} target="_blank" rel="noopener noreferrer" className={linkClass}>
              @{contact.instagram}
            </a>
          </InfoRow>
        )}
        {contact.email && (
          <InfoRow icon={AtSign} label="E-mail">
            <a href={`mailto:${contact.email}`} className={linkClass}>
              {contact.email}
            </a>
          </InfoRow>
        )}
        {(company?.legalName || company?.cnpj) && (
          <InfoRow icon={Store} label={company.legalName ? 'Razão social' : 'CNPJ'}>
            {company.legalName && <span className="block">{company.legalName}</span>}
            {company.cnpj && <span className="block tabular-nums">{company.legalName ? 'CNPJ ' : ''}{formatPixKey('cnpj', company.cnpj)}</span>}
          </InfoRow>
        )}
      </dl>
    </Card>
  );
}
