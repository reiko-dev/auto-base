import type { LucideIcon } from 'lucide-react';

type Variant = 'accent' | 'brand' | 'glass';

const VARIANTS: Record<Variant, string> = {
  accent: 'bg-accent text-on-accent ring-1 ring-white/45 shadow-[0_0_28px_-4px_var(--accent)]',
  brand: 'bg-brand text-white ring-1 ring-[#6b9bff]/70 shadow-[0_0_28px_-6px_#3b74ff]',
  glass: 'glass-button text-white',
};

interface Props {
  icon: LucideIcon;
  label: string;
  variant?: Variant;
  /** lg = botões principais (WhatsApp, Pix); md = demais. */
  size?: 'lg' | 'md';
  href?: string;
  /** Abre em nova aba (links externos). */
  external?: boolean;
  onClick?: () => void;
  /** Classes extras para o ícone (ex.: estrela dourada). */
  iconClassName?: string;
}

export function ActionButton({ icon: Icon, label, variant = 'glass', size = 'md', href, external, onClick, iconClassName = '' }: Props) {
  const sizing = size === 'lg' ? 'min-h-14 text-[17px] font-bold' : 'min-h-12 text-[15px] font-semibold';
  const classes = `flex h-full items-center justify-center gap-2.5 rounded-2xl px-3 text-center transition active:scale-[0.98] hover:brightness-110 ${sizing} ${VARIANTS[variant]}`;
  const content = (
    <>
      <Icon aria-hidden className={`${size === 'lg' ? 'size-6' : 'size-5'} shrink-0 ${iconClassName}`} strokeWidth={2} />
      {label}
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
    'glass-button flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1.5 py-3 text-center text-[13px] font-semibold text-white transition active:scale-[0.97] hover:brightness-110';
  const content = (
    <>
      <Icon aria-hidden className="size-6 text-accent" strokeWidth={1.8} />
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
