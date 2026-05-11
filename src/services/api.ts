import axios from 'axios';

export function setUrl(ip: string, port: string) {
  return axios.create({
    baseURL: `http://${ip}:${port}/`,
  });
}
