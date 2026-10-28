import { Check, ChevronDown, Copy, QrCode } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { profile } from '../config/profile';
import { formatPixKey, parsePix, resolvePixCode } from '../lib/pix';

const KEY_LABEL = { cpf: 'CPF', cnpj: 'CNPJ', email: 'e-mail', phone: 'telefone', evp: 'aleatória' } as const;

export function PixCard() {
  const pix = profile.pix!;
  const code = useMemo(() => resolvePixCode(pix), [pix]);
  const parsed = useMemo(() => parsePix(code), [code]);

  // No celular o QR fica recolhido (ninguém escaneia a própria tela); no computador já aparece aberto.
  const [qrOpen, setQrOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const manualRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!qrOpen || qrSrc) return;
    let alive = true;
    // A biblioteca de QR só é baixada quando o QR é exibido.
    import('qrcode')
      .then(({ default: QR }) => QR.toString(code, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 }))
      .then((svg) => alive && setQrSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`))
      .catch(() => alive && setQrSrc(null));
    return () => {
      alive = false;
    };
  }, [qrOpen, qrSrc, code]);

  useEffect(() => {
    if (manual) manualRef.current?.select();
  }, [manual]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setManual(false);
    } catch {
      setManual(true);
    }
  }

  return (
    <section id="pix" aria-labelledby="pix-title" className="card scroll-mt-4">
      <div className="flex items-center gap-2">
        <QrCode aria-hidden className="size-5 text-accent" />
        <h2 id="pix-title" className="text-lg font-bold text-white">
          Pague com Pix
        </h2>
      </div>

      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-slate-400">Recebedor</dt>
          <dd className="font-semibold text-white">{parsed.receiverName}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-slate-400">Chave ({KEY_LABEL[pix.keyType]})</dt>
          <dd className="font-semibold text-white tabular-nums">{formatPixKey(pix.keyType, parsed.key)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-slate-400">Valor</dt>
          <dd className="font-semibold text-white">{parsed.amount ? `R$ ${parsed.amount.replace('.', ',')}` : 'você digita no app do banco'}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={copy}
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-base font-bold text-on-accent shadow-[0_8px_28px_-10px_var(--accent)] transition active:scale-[0.98] hover:brightness-110"
      >
        {copied ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-5" />}
        {copied ? 'Código copiado' : 'Copiar código Pix'}
      </button>

      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-slate-300">
        {copied && (
          <>
            Agora abra o app do seu banco → <strong className="text-white">Pix</strong> →{' '}
            <strong className="text-white">Pix Copia e Cola</strong> e cole o código.
          </>
        )}
      </p>

      {manual && (
        <label className="mt-2 block text-sm text-slate-300">
          Não deu para copiar sozinho. Selecione o código abaixo e copie:
          <textarea
            ref={manualRef}
            readOnly
            value={code}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl bg-black/30 p-3 font-mono text-xs break-all text-white ring-1 ring-white/15"
          />
        </label>
      )}

      <button
        type="button"
        aria-expanded={qrOpen}
        aria-controls="pix-qr"
        onClick={() => setQrOpen((open) => !open)}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-slate-200 glass-button"
      >
        {qrOpen ? 'Ocultar QR Code' : 'Mostrar QR Code'}
        <ChevronDown aria-hidden className={`size-4 transition ${qrOpen ? 'rotate-180' : ''}`} />
      </button>

      {qrOpen && (
        <div id="pix-qr" className="mt-3 flex justify-center">
          <div className="rounded-2xl bg-white p-3">
            {qrSrc ? (
              <img src={qrSrc} alt={`QR Code Pix de ${profile.name}`} width={220} height={220} className="size-[220px]" />
            ) : (
              <div className="size-[220px] animate-pulse rounded-lg bg-slate-200" />
            )}
          </div>
        </div>
      )}

      <p className="mt-4 text-[13px] leading-snug text-slate-400">
        Antes de confirmar, veja se o app do banco mostra como recebedor <span className="text-slate-200">{parsed.receiverName}</span>.
      </p>
    </section>
  );
}
