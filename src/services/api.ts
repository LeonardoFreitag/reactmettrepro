import axios from 'axios';

function setUtl(ip: string, port: string) {
  const api = axios.create({
    // `//viacep.com.br/ws/${cep}/json`
    baseURL: `http://${ip}:${port}/`,
  });
  return api;
}

export { setUtl };
