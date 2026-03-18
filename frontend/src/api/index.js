import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const login = (name, email) => 
  api.post('/login', { name, email });

export const getQuestions = (qpName) => 
  api.get(`/questions/${qpName}`);

export const submitResult = (resultData) => 
  api.post('/submit', resultData);

export const getRankings = (email) => 
  api.get(`/rankings`, { params: { email } });

export default api;
