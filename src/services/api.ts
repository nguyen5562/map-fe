import axios from 'axios';
import { API_URL } from '../const/apiConfig';

export const api = axios.create({
  baseURL: API_URL,
});