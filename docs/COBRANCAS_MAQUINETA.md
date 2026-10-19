# Provedor por aparelho, modo Terminal, Cobranças e estorno (15/09/2026)

Implementação do `PROMPT_APP_ReactMettre_Cobrancas.md` (Etapa A Cielo + Etapa B Stone). Depende da API `servernodepro` com os módulos `pagamentos` e `cobrancas` (ver `servernodepro/docs/rotas-pagamentos-cobrancas.md`).

## Mapa do código

| Arquivo | Papel |
|---|---|
| `src/payment/types.ts` | Interface `PaymentProvider` (`pay`, `reverse`, `print?`, `isConfigured`, `isWaiting`), `PAYMENT_METHODS` (lista de tipos da UI), rótulos. |
| `src/payment/cielo.ts` | Adaptador Cielo: envolve `hooks/useCieloDeepLink` (ganhou `sendReversal` → `lio://payment-reversal` e `installments` opcional). De/para `transactionType+installments ↔ paymentCode`. |
| `src/payment/stone.ts` + `hooks/useStoneDeepLink.ts` | Adaptador Stone (Etapa B): `payment-app://pay`, `cancel-app://cancel`, retorno em `order://…` (query string). Sem credenciais. |
| `src/payment/index.ts` | `usePaymentProvider()` — escolhe pelo `config.provider` (default `CIELO`). |
| `src/models/ConfigModel.ts` | Campos novos `provider`, `terminalId`, `apiKey`, `modoTerminalAtivo`, `cobrancasAtivas` + `normalizeConfig` (instalações antigas ganham defaults). |
| `src/services/api.ts` | `configureApiKey()`; `setUrl` envia `X-Api-Key` quando configurada. |
| `src/sync/outbox.ts` | Fila de saída persistida (`claim`/`patch`/`cancelar`) + drainer (10 s, foreground). `PATCH` nunca é descartado. |
| `src/sync/cobrancasApi.ts` | Chamadas `/cobrancas/*` e `buildDesfecho`. |
| `src/sync/executarCobranca.ts` | pay/reverse → desfecho → fila → "Concluídas". Usado por Terminal e Cobranças. |
| `src/terminal/ativo.ts` | `modoTerminalConfigurado()` (modo ligado + Terminal ID + provedor) e as rotas de plantão. Compartilhado pelo poller, pelo login e pela faixa. |
| `src/terminal/TerminalRunner.tsx` | Poller attended (2,5 s) montado em `App.tsx`; claim; navega para `terminal`; recuperação após reinício (`terminal.current`). Atende a partir das telas de plantão: **espera** e Comandas. |
| `src/pages/TerminalEspera` | Tela de plantão: Terminal ID, provedor, estado da conexão e hora da última consulta. Destino do login num aparelho de terminal. |
| `src/components/TerminalPausadoBanner` | Faixa "Modo Terminal pausado" nas telas em que o poller não atende. Fica em `App.tsx`, em fluxo acima das telas. |
| `src/pages/Terminal` | Tela cheia: valor, "Aguardando cliente…", cancelar antes do Deep Link, resultado 1,5 s. |
| `src/pages/Cobrancas` | Cards (Minhas entregas / Mesas / Concluídas), cache `cobrancas.cache`, offline-first. |
| `src/components/MetodoPagamentoModal` | Escolha/confirmação de tipo e parcelas. |
| `plugins/withStoneQueries.js` | `<queries>` por scheme para Android 11+. |

## Fluxo do garçom (inalterado)
`Atendimento` + `FechamentoModal` chamam `provider.pay(...)`, `POST /pagamentos` (`origem:'M'`) e `GET /pagamentos/M/:codMesa`. Rótulos "Pagar na maquineta". "Crédito parcelado" continua com `installments: 0` (a Cielo pergunta).

## Configurações → Maquineta
Provedor (Cielo/Stone), Terminal ID, X-Api-Key, toggles "Modo Terminal de pagamento" e "Tela Cobranças". Credenciais Cielo só aparecem com provedor Cielo.

## Modo Terminal: plantão, faixa e sem comunicação (16/09/2026)

O poller nunca atendeu por cima de um modal — a proteção contra abrir a cobrança debaixo do `FechamentoModal` e contra duas esperas de Deep Link continua igual. O que mudou é onde o aparelho fica parado: existe uma tela de espera própria, e ela entrou na lista de rotas de plantão junto com a lista de comandas.

Num aparelho com Modo Terminal configurado, o login cai na tela de espera (com `reset`, para o botão voltar não descer ao login; na espera o voltar é bloqueado). "Abrir comandas" leva à lista quando o mesmo aparelho também é usado como garçom, e sair da espera não desliga o modo. Depois de um desfecho, a tela Terminal volta para onde veio.

Nas telas em que o poller não atende — dentro de uma comanda, configurações, cards — aparece a faixa "Modo Terminal pausado", que leva de volta à espera ao toque. Ela existe para o problema ser percebido no aparelho, e não do outro lado, pelo caixa esperando o modal do Frente.

A tela de espera distingue "nenhuma cobrança pendente" (estado normal e silencioso) de queda: depois de três consultas seguidas sem resposta, passa a dizer "sem comunicação com o servidor desde HH:MM" e volta sozinha ao normal quando a API responde. O contador fica em `terminal/state.ts` (`falhasSeguidas`, `ultimaConsultaOkEm`); a barra da tela de comandas continua com o comportamento antigo, de acusar já na primeira falha.

## Decisões
- Cancelar na tela Terminal (antes do Deep Link) grava `PATCH canceled` (a cobrança já está `sent_to_terminal`; `POST /cancelar` só marcaria `CANCEL_REQUESTED`).
- Sem NetInfo: o drainer roda por intervalo + AppState; o "offline" da tela Cobranças é inferido pela falha da última chamada.
- Reinício com cobrança `sent_to_terminal`: pergunta ao operador; "Sim, foi paga" grava `error` com motivo (não `approved` sem retorno do provedor).
- Stone: retorno é considerado aprovado quando não há `reason`/status de falha e há `atk` (pagamento). Conferir contra o parser do app AutoMax Stone POS.

## Callback do Deep Link resiliente e `POST /pagamentos` pela fila (19/10/2026 — v1.11.0)

Motivo: o Pix demora minutos com o QR Code na tela da Cielo e o Android pode recriar
a Activity ou matar o processo do app nesse meio tempo. A resposta `order://response`
chega então como intent de **lançamento** — só `Linking.getInitialURL()` a vê — e a
Promise do hook que iniciou o pagamento já não existe: pagamento aprovado na Cielo
sem registro no servidor. Versão nova exige rebuild nativo (`expo-keep-awake`).

| Arquivo | Papel |
|---|---|
| `src/payment/cieloCallback.ts` / `stoneCallback.ts` | Parsers puros do retorno (`order://response?response=<base64>` e query string da Stone). Testados em `src/payment/__tests__`. |
| `src/payment/cieloMapping.ts` | De/para puro `transactionType ↔ paymentCode`, `normalizeCieloOk` (Pix identificado por `paymentFields.primaryProductName`; `authCode` de 32 chars preservado) e `providerData.reference`. |
| `src/payment/pending.ts` | Registro persistido do pagamento em andamento, gravado **antes** do `Linking.openURL`: `{ idLocal, provider, origem, codVenda, cobrancaId?, amountCents, totalCents, paidBeforeCents, transactionType, installments, voucherKind?, itens, reference, descricao, iniciadoEm }`. Apagado ao concluir. |
| `src/payment/deepLinkInbox.ts` | Listener global (`startInbox()` em `App.tsx`, antes do primeiro render): trata `getInitialURL()` e o evento `url`, casa a resposta com o pendente pela `reference` (ou pelo único pendente), grava e entrega ao hook que espera (`registerWaiter`). `subscribeInbox` avisa a tela da comanda. |
| `src/payment/PendingRecovery.tsx` | Ao iniciar: depois do inbox tratar a URL inicial, pendente sem resposta vira o alerta "Cobrança em aberto de R$ X na Comanda Y": **Aprovado (registrar manualmente)** / **Não aprovado (descartar)** / **Verificar depois**. |
| `src/sync/outbox.ts` | Tipos novos `pagamento` (`POST /pagamentos`) e `fechaConta` (`POST /mesas/fechaConta {destino:'F'}`); `drainNow()` agora espera a passada que inclui o item recém-enfileirado. |
| `src/pages/Atendimento/pagamentosLocais.ts` | Mescla servidor + fila + recusados para o "já pago" da comanda. |
| `src/hooks/useCieloDeepLink.ts` / `useStoneDeepLink.ts` | Não escutam mais a URL: registram o *waiter* no inbox e resolvem a Promise a partir dele. API `sendPayment/sendReversal/printText/cancelWait/isWaiting` mantida. Ao desmontar, soltam o waiter (o inbox grava sozinho). |
| `src/terminal/state.ts` | `expo-keep-awake` ativo enquanto algum provedor aguarda a maquineta (`providerWaiting > 0`). |

### `reference` estruturada

`<origem>:<codVenda>:<idLocal>` (ex.: `M:55:3f2a1c9e-…`, ≤ 60 chars → coluna `REFERENCIA`).
A Cielo ecoa `reference` na ordem; a Stone ecoa `order_id`. Vai também em
`providerData.reference` do `POST /pagamentos` e do `pagamento` do `PATCH /cobrancas/:id`.
Na Stone o `order_id` é o `CIELO_ORDER_ID` da API: por ser único por tentativa, o índice
`(PROVIDER, CIELO_ORDER_ID)` não colide quando a mesma cobrança é tentada duas vezes.

### Fluxo do garçom (comanda) — o que mudou

1. `handleCieloPayment` grava o pendente (`paidBeforeCents` = soma do que já estava
   pago) → `provider.pay({ reference })`.
2. A resposta chega ao inbox: ele **sempre** enfileira o `POST /pagamentos` (fila
   `pagamento`, deduplicada por `idLocal`; a API é idempotente por
   `(PROVIDER, CIELO_ORDER_ID)` / `(PROVIDER, REFERENCIA)`) e resolve a Promise do hook.
   O `POST` direto do `Atendimento` foi removido — não há mais duplicidade possível.
3. `Atendimento` faz `await drainNow()` e avisa: servidor recusou (4xx → `erros`,
   "anote o código e registre manualmente"; continua contando localmente) ou sem conexão
   ("será enviado automaticamente"). Depois recarrega "já pago" (servidor + fila +
   recusados). Na lista do modal, item da fila aparece com "(a sincronizar)".
4. `FechamentoModal` continua decidindo `onCieloComplete` → `handleFechamentoCielo`, que
   agora faz `await drainNow()` antes do `fechaConta` para o caixa ver os pagamentos
   junto com a impressão.

### Cold start (app morto durante o Pix)

- Sem hook esperando, o inbox grava e, se `paidBeforeCents + amountCents ≥ totalCents`,
  enfileira **um** `fechaConta` logo depois do `pagamento` (ordem da fila) — regra da
  impressão única mantida. `fechaConta` não é idempotente na API (sempre insere em
  `impressoes_caixa`), então na fila ele **não** é reenviado em 5xx (vai para `erros`);
  só em falha de rede sem resposta.
- Pendente do modo Terminal (`cobrancaId`): sem hook esperando, o inbox enfileira o
  `PATCH approved` com o `pagamento` e limpa `terminal.current`; o `TerminalRunner` não
  pergunta quando a fila já tem o PATCH (`pending_sync`). Em processo nada mudou:
  `executarCobranca` grava o PATCH.
- Mesma URL reentregue (reabrir pelo "recentes") é ignorada quando não há hook esperando
  (`inbox.lastUrl`).
- "Aprovado (registrar manualmente)" grava `rawResponse: { manual: true, motivo, reference,
  iniciadoEm }` e `providerData.manual = true` (+ `paymentCode` na Cielo, `resumo.authCode =
  'MANUAL'` só local). Se completar o total, enfileira o `fechaConta`.

### Testes (`pnpm test`, jest-expo 54 — roda no macOS)

`src/payment/__tests__`: parser do `order://response` com e sem quebras de linha no base64,
payload de erro, Pix com `authCode` de 32 chars e `brand` vazia; Stone; `reference`/
`matchPendente`/`completaTotal`; inbox em cold start (grava `pagamento`, `fechaConta` uma vez,
PATCH do modo Terminal, dedupe de URL). `src/pages/Atendimento/__tests__`: `calcParcial`
inalterado e mescla servidor + fila.

### Roteiro no emulador Cielo

O emulador **não** reproduz o E2E de 32 chars do Pix: a prova é o teste unitário + a coluna
`AUTH_CODE VARCHAR(40)` na API nova. Exercitar: 2 clientes dividindo itens em 2 cartões;
parte da quantidade de um item; combinado; reabrir a comanda no meio; Pix; **matar o app
durante o pagamento e reabrir** (a resposta entra por `getInitialURL`; sem resposta, aparece
"Cobrança em aberto"); desligar a rede durante o `POST` (alerta "sem conexão", badge "a
sincronizar" na lista de comandas, reenvio ao voltar a rede, `fechaConta` só depois).

### O que o time Delphi precisa saber

- `CIELO_PAGAMENTOS.AUTH_CODE` e `CIELO_CODE` passam a `VARCHAR(40)` (Pix = E2E ID de 32).
- Coluna nova `REFERENCIA VARCHAR(60)` = `<origem>:<codVenda>:<idLocal>`.
- `PAYLOAD_JSON` pode ser `{ "manual": true, "motivo": … }` e `providerData.manual = true`
  quando o operador confirmou o pagamento sem retorno da maquineta (sem `CIELO_ORDER_ID`,
  sem `AUTH_CODE`): conferir o comprovante antes de conciliar.
- Ordem de atualização por cliente: migração do banco → API nova → app (a Cielo Store
  atualiza o app sozinha).
