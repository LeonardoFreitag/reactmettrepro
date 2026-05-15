import axios from 'axios';

function isIpAddress(host: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host.trim());
}

export function setUrl(ip: string, port: string) {
  const host = ip.trim();
  const hasPort = port && port.trim().length > 0;

  // Já tem protocolo explícito — usa como está
  if (host.startsWith('http://') || host.startsWith('https://')) {
    const base = hasPort ? `${host}:${port.trim()}` : host;
    return axios.create({ baseURL: base.endsWith('/') ? base : `${base}/` });
  }

  // Endereço IP — http + porta obrigatória
  if (isIpAddress(host)) {
    return axios.create({ baseURL: `http://${host}:${port.trim()}/` });
  }

  // Domínio — https, porta opcional
  const base = hasPort
    ? `https://${host}:${port.trim()}`
    : `https://${host}`;
  return axios.create({ baseURL: `${base}/` });
}

export { isIpAddress };
