/**
 * Regras compartilhadas do Modo Terminal (attended): quem pode ficar de plantão
 * e em quais telas o poller atende.
 *
 * Fica separado do TerminalRunner porque o SignIn (para escolher o destino do
 * login) e a faixa de "pausado" precisam da mesma resposta.
 */
import { ConfigModel } from '../models/ConfigModel';
import { isStoneConfigured } from '../payment/stone';

/**
 * O aparelho está configurado para ficar de plantão como terminal do caixa?
 * Exige o modo ligado, um Terminal ID e o provedor de pagamento configurado —
 * sem provedor o poller consumiria cobranças só para recusá-las.
 */
export function modoTerminalConfigurado(config: ConfigModel | null | undefined): boolean {
  if (!config?.modoTerminalAtivo) return false;
  if (!config.terminalId?.trim()) return false;
  return config.provider === 'STONE'
    ? isStoneConfigured(config)
    : !!(config.cieloClientId && config.cieloAccessToken);
}

/**
 * Telas a partir das quais o poller atende uma cobrança.
 *
 * A restrição existe desde o início para não abrir a tela de cobrança por baixo
 * de um Modal (FechamentoModal, MetodoPagamentoModal) nem deixar duas esperas de
 * Deep Link simultâneas. O que mudou é que agora existe uma tela feita para ficar
 * parada — a de espera — em vez de depender da lista de comandas.
 */
export const ROTAS_PLANTAO: string[] = ['comandas', 'terminalEspera'];

/**
 * Telas em que a faixa "Modo Terminal pausado" NÃO aparece: as de plantão, a da
 * cobrança em andamento (não está pausado, está cobrando) e o login.
 */
export const ROTAS_SEM_FAIXA: string[] = [...ROTAS_PLANTAO, 'terminal', 'signin'];

export function ehRotaDePlantao(rota: string | undefined): boolean {
  return !!rota && ROTAS_PLANTAO.includes(rota);
}
