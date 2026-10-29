import { useEffect, useState } from 'react';
import { profile } from '../config/profile';
import { getOpenStatus, type OpenState } from '../lib/hours';

const BASE = import.meta.env.BASE_URL;

const STATUS_STYLE: Record<OpenState, { pill: string; head: string; dot: string }> = {
  open: { pill: 'border-emerald-400/60 bg-emerald-500/10', head: 'text-emerald-300', dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]' },
  closed: { pill: 'border-rose-400/50 bg-rose-500/10', head: 'text-rose-300', dot: 'bg-rose-400' },
  unknown: { pill: 'border-amber-300/50 bg-amber-400/10', head: 'text-amber-200', dot: 'bg-amber-300' },
};

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function OpenStatusPill() {
  const now = useNow();
  if (!profile.hours) return null;
  const status = getOpenStatus(profile.hours, profile.timezone, now);
  const style = STATUS_STYLE[status.state];
  // "Aberto agora · fecha às 18h" → primeira parte colorida, resto em branco.
  const [head, ...rest] = status.label.split(' · ');
  return (
    <p className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${style.pill}`}>
      <i aria-hidden className={`size-2.5 shrink-0 rounded-full ${style.dot}`} />
      <span>
        <span className={`font-semibold ${style.head}`}>{head}</span>
        {rest.length > 0 && <span className="text-white"> · {rest.join(' · ')}</span>}
      </span>
    </p>
  );
}

export function Hero() {
  const { images } = profile;
  return (
    <header>
      {images.cover && (
        <img
          src={BASE + images.cover}
          alt={images.coverAlt ?? profile.name}
          width={960}
          height={463}
          fetchPriority="high"
          // A base da capa se dissolve no fundo da página.
          className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_86%,transparent)]"
        />
      )}
      <div className={`px-5 ${images.cover ? 'pt-2' : 'pt-10'}`}>
        <p className="text-xs font-semibold tracking-[0.28em] text-slate-300 uppercase">{profile.category}</p>
        <h1 className="mt-1 font-display text-[36px] leading-[1.05] font-extrabold tracking-tight text-white">{profile.name}</h1>
        {profile.tagline && <p className="mt-1.5 text-base leading-snug text-slate-300">{profile.tagline}</p>}
        <OpenStatusPill />
      </div>
    </header>
  );
}
