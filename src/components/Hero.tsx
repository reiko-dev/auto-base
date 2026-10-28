import { useEffect, useState } from 'react';
import { profile } from '../config/profile';
import { getOpenStatus, type OpenState } from '../lib/hours';

const BASE = import.meta.env.BASE_URL;

const STATUS_STYLE: Record<OpenState, string> = {
  open: 'bg-emerald-400/15 text-emerald-200 [&>i]:bg-emerald-400',
  closed: 'bg-rose-400/15 text-rose-200 [&>i]:bg-rose-400',
  unknown: 'bg-amber-300/15 text-amber-100 [&>i]:bg-amber-300',
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
  return (
    <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_STYLE[status.state]}`}>
      <i aria-hidden className="size-2 rounded-full" />
      {status.label}
    </p>
  );
}

export function Hero() {
  const { images } = profile;
  return (
    <header className="md:px-4">
      {images.cover && (
        <img
          src={BASE + images.cover}
          alt={images.coverAlt ?? profile.name}
          width={960}
          height={463}
          fetchPriority="high"
          className="block h-auto w-full md:rounded-3xl"
        />
      )}
      <div className={`relative px-4 md:px-0 ${images.cover ? 'mt-3' : 'pt-8'}`}>
        <div className="card">
          <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">{profile.category}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">{profile.name}</h1>
          {profile.tagline && <p className="mt-1 text-[15px] text-slate-300">{profile.tagline}</p>}
          <OpenStatusPill />
        </div>
      </div>
    </header>
  );
}
