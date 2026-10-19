import axios from 'axios';

function isIpAddress(host: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host.trim());
}

/**
 * Chave enviada em `X-Api-Key` (rotas /cobrancas e POST /pagamentos).
 * Definida por configStorage (configGet/configSave). Vazia = header não enviado.
 */
let apiKey = '';
export function configureApiKey(key: string | null | undefined) {
  apiKey = (key ?? '').trim();
}
export function getApiKey(): string {
  return apiKey;
}

function baseHeaders(): Record<string, string> {
  return apiKey ? { 'X-Api-Key': apiKey } : {};
}

export function setUrl(ip: string, port?: string) {
  const host = ip.trim();
  const portStr = (port ?? '').trim();
  const hasPort = portStr.length > 0;
  const headers = baseHeaders();

  // Já tem protocolo explícito — usa como está
  if (host.startsWith('http://') || host.startsWith('https://')) {
    const base = hasPort ? `${host}:${portStr}` : host;
    return axios.create({ baseURL: base.endsWith('/') ? base : `${base}/`, headers });
  }

  // Endereço IP — http + porta obrigatória
  if (isIpAddress(host)) {
    return axios.create({ baseURL: `http://${host}:${portStr}/`, headers });
  }

  // Domínio — https, porta opcional
  const base = hasPort
    ? `https://${host}:${portStr}`
    : `https://${host}`;
  return axios.create({ baseURL: `${base}/`, headers });
}

export { isIpAddress };
