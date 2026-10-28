import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'accent' | 'brand' | 'glass';

const VARIANTS: Record<Variant, string> = {
  accent: 'bg-accent text-on-accent shadow-[0_8px_28px_-10px_var(--accent)]',
  brand: 'bg-brand text-white shadow-[0_8px_28px_-12px_var(--brand)]',
  glass: 'glass-button text-white',
};

interface Props {
  icon: LucideIcon;
  label: string;
  hint?: ReactNode;
  variant?: Variant;
  href?: string;
  /** Abre em nova aba (links externos). */
  external?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ActionButton({ icon: Icon, label, hint, variant = 'glass', href, external, onClick, className = '' }: Props) {
  const classes = `flex h-full min-h-16 items-center gap-3 rounded-2xl px-4 py-3 text-left transition active:scale-[0.98] hover:brightness-110 ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      <Icon aria-hidden className="size-6 shrink-0" strokeWidth={2.2} />
      <span className="min-w-0">
        <span className="block font-bold leading-tight">{label}</span>
        {hint && <span className="block truncate text-[13px] leading-tight opacity-75">{hint}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}

/** Botão compacto com ícone em cima e rótulo embaixo. */
export function MiniAction({ icon: Icon, label, href, onClick }: Pick<Props, 'icon' | 'label' | 'href' | 'onClick'>) {
  const classes =
    'glass-button flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.97] hover:brightness-110';
  const content = (
    <>
      <Icon aria-hidden className="size-5 text-accent" strokeWidth={2.2} />
      {label}
    </>
  );
  return href ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
