import axios from 'axios';

const api = axios.create({
  baseURL: 'https://melodyhub-ai.onrender.com/api', // Our backend URL
  withCredentials: true, // Crucial for maintaining auth credentials across mobile/desktop views
});

// Automatically add the token to requests whether stored as standalone or inside userInfo
api.interceptors.request.use((config) => {
  try {
    let token = localStorage.getItem('token');
    
    if (!token) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        token = userInfo.token;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error attaching authorization token to request", error);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;