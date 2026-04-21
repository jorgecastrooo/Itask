import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; // URL do backend FastAPI

export async function getUsers() {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
}
