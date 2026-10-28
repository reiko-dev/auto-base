# Auto Base · Cartão digital

Perfil público da **Auto Base — Lavagem automotiva** (Rio Branco - AC), aberto pelo cartão NFC e por QR Code.
Site estático, sem backend e sem mensalidade, publicado no GitHub Pages.

Serviço **Perfil público básico** da [AKRY Solutions](http://www.akrysolutions.com.br/).

## O que a página tem

- WhatsApp com mensagem pronta, Como chegar (Google Maps), Instagram
- **Pix**: botão "Copiar código Pix" (Pix Copia e Cola) e QR Code; mostra recebedor e chave
- Status "Aberto agora / Fechado", calculado no fuso de Rio Branco
- Ligar, Salvar contato (.vcf) e Compartilhar
- Horário da semana, endereço, WhatsApp, Instagram e CNPJ
- Prévia de link (WhatsApp/Instagram) e dados estruturados para o Google

Blocos opcionais que aparecem sozinhos quando preenchidos: **Avaliar no Google** (precisa do Place ID),
**Serviços e preços** e **Links**.

## Onde mudar os dados

Tudo fica em [`src/config/profile.ts`](src/config/profile.ts). Imagens em `public/`:

| Arquivo | Uso |
|---|---|
| `capa.webp` | Capa no topo da página (960 × 463) |
| `og.jpg` | Prévia do link no WhatsApp (1200 × 630) |
| `favicon.png`, `apple-touch-icon.png` | Ícones |

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes do Pix e dos horários
npm run build    # gera dist/
```

## Publicação

Cada push na `main` roda os testes, gera o site e publica pelo workflow `.github/workflows/deploy.yml`.

Na primeira vez: **Settings → Pages → Build and deployment → Source: GitHub Actions** e depois
**Actions → Publicar no GitHub Pages → Run workflow**.

- O repositório precisa ser **público** (no plano Free, o Pages só é gratuito em repositório público).
- Domínio próprio: configure em Settings → Pages → Custom domain. Não precisa de arquivo `CNAME`;
  o endereço da página e da prévia de link se ajustam sozinhos no próximo deploy.

## Pix

O código usado é o Pix Copia e Cola fornecido pelo cliente (`pix.code` em `profile.ts`). Os testes garantem
que o CRC confere e que recebedor, chave e cidade batem com os campos declarados. Se `pix.code` for removido,
o código é gerado a partir da chave, nome e cidade.

Antes de entregar, teste de verdade: leia o QR em dois apps de banco diferentes e cole o código em
"Pix Copia e Cola" em um deles. Confira se o banco mostra o recebedor correto e faça um Pix de R$ 0,01.

## Gravar no NFC

Grave no cartão um registro **URL** com o endereço final da página (ex.: `https://reiko-dev.github.io/auto-base/`).
Depois de testar, deixe a tag **somente leitura** para ninguém regravar.

## Pendências com o cliente

- [ ] Horário de sábado (hoje aparece "Consulte pelo WhatsApp")
- [ ] Tabela de preços (`services`)
- [ ] Perfil da loja no Google Maps / Place ID (habilita "Avaliar no Google")
- [ ] CEP e razão social (opcionais)
- [ ] Endereço definitivo da página antes de gravar o NFC
