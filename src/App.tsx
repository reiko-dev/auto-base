import { Camera, MapPin, MessageCircle, Phone, QrCode, Share2, Star, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionButton, MiniAction } from './components/ActionButton';
import { HoursCard, InfoCard, LinksCard, ServicesCard } from './components/Cards';
import { Hero } from './components/Hero';
import { PixCard } from './components/PixCard';
import { profile } from './config/profile';
import { directionsUrl, fullAddress, instagramUrl, resolveSiteUrl, reviewUrl, telUrl, whatsappUrl } from './lib/links';
import { downloadVCard } from './lib/vcard';

const siteUrl = resolveSiteUrl(profile.siteUrl, import.meta.env.VITE_SITE_URL);

function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const notify = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { message, notify };
}

export default function App() {
  const { message, notify } = useToast();
  const { contact, location, pix } = profile;
  const address = location && fullAddress(location);

  const primary = [
    contact.whatsapp && (
      <ActionButton
        key="wa"
        variant="accent"
        size="lg"
        icon={MessageCircle}
        label="WhatsApp"
        href={whatsappUrl(contact.whatsapp, contact.whatsappMessage)}
        external
      />
    ),
    pix && <ActionButton key="pix" variant="brand" size="lg" icon={QrCode} label="Pix" href="#pix" />,
    address && location && (
      <ActionButton key="map" icon={MapPin} label="Como chegar" href={directionsUrl(address, location.googlePlaceId)} external />
    ),
    contact.instagram && <ActionButton key="ig" icon={Camera} label="Instagram" href={instagramUrl(contact.instagram)} external />,
    location?.googlePlaceId && (
      <ActionButton key="review" icon={Star} label="Avaliar no Google" href={reviewUrl(location.googlePlaceId)} external />
    ),
  ].filter(Boolean);

  async function share() {
    const data = { title: profile.name, text: `${profile.name} · ${profile.category}`, url: siteUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* usuário cancelou */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(siteUrl);
      notify('Link do cartão copiado');
    } catch {
      notify(siteUrl);
    }
  }

  return (
    // No computador, a página vira uma "tela de celular" com borda luminosa, como no mockup.
    <div className="screen-bg mx-auto min-h-dvh max-w-[480px] pb-6 md:my-10 md:min-h-0 md:overflow-hidden md:rounded-[2.25rem] md:shadow-[0_0_70px_-14px_rgba(47,107,255,0.75)] md:ring-1 md:ring-sky-300/35">
      <Hero />

      <main className="mt-5 space-y-3 px-4">
        <nav aria-label="Ações principais" className="grid grid-cols-2 gap-2.5">
          {primary.map((button, i) => (
            <div key={i} className={primary.length % 2 === 1 && i === primary.length - 1 ? 'col-span-2' : ''}>
              {button}
            </div>
          ))}
        </nav>

        {pix && <PixCard />}

        <div className="grid grid-cols-3 gap-2.5">
          {(contact.phone || contact.whatsapp) && <MiniAction icon={Phone} label="Ligar" href={telUrl((contact.phone || contact.whatsapp)!)} />}
          <MiniAction
            icon={UserPlus}
            label="Salvar contato"
            onClick={() => {
              downloadVCard(profile, siteUrl);
              notify('Contato baixado');
            }}
          />
          <MiniAction icon={Share2} label="Compartilhar" onClick={share} />
        </div>

        {!!profile.services?.length && <ServicesCard />}
        {!!profile.links?.length && <LinksCard />}
        {profile.hours && <HoursCard />}
        <InfoCard />
      </main>

      <footer className="mx-6 mt-8 border-t border-sky-100/10 pt-5 text-center text-sm text-slate-400">
        Cartão digital por{' '}
        <a href={profile.credit.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-accent">
          {profile.credit.label}
        </a>
      </footer>

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-4 transition duration-200 ${
          message ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {message && <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">{message}</span>}
      </div>
    </div>
  );
}
