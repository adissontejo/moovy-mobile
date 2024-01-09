import axios from 'axios';
import Config from 'react-native-config';

console.log(Config.API_URL);

export const api = axios.create({
  baseURL: Config.API_URL,
});
