import { AtSign, MessageCircle, Navigation, Phone, QrCode, Share2, Star, UserPlus } from 'lucide-react';
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
        icon={MessageCircle}
        label="WhatsApp"
        hint="Fale conosco"
        href={whatsappUrl(contact.whatsapp, contact.whatsappMessage)}
        external
      />
    ),
    pix && <ActionButton key="pix" variant="brand" icon={QrCode} label="Pix" hint="Pagar agora" href="#pix" />,
    address && location && (
      <ActionButton key="map" icon={Navigation} label="Como chegar" hint={location.district && `Bairro ${location.district}`} href={directionsUrl(address, location.googlePlaceId)} external />
    ),
    contact.instagram && (
      <ActionButton key="ig" icon={AtSign} label="Instagram" hint={`@${contact.instagram}`} href={instagramUrl(contact.instagram)} external />
    ),
    location?.googlePlaceId && (
      <ActionButton key="review" icon={Star} label="Avaliar no Google" hint="Sua opinião ajuda" href={reviewUrl(location.googlePlaceId)} external />
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
    <div className="mx-auto max-w-[480px] pb-8 md:pt-8">
      <Hero />

      <main className="mt-4 space-y-4 px-4">
        <nav aria-label="Ações principais" className="grid grid-cols-2 gap-3">
          {primary.map((button, i) => (
            <div key={i} className={primary.length % 2 === 1 && i === primary.length - 1 ? 'col-span-2' : ''}>
              {button}
            </div>
          ))}
        </nav>

        {pix && <PixCard />}

        <div className="grid grid-cols-3 gap-3">
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

      <footer className="mt-8 px-4 text-center text-xs text-slate-500">
        Cartão digital por{' '}
        <a href={profile.credit.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-accent">
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
