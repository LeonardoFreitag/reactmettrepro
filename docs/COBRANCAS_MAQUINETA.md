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
