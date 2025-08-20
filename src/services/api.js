import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000, // Increased timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is a network error and we haven't already retried
    if (
      (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        return await api(originalRequest);
      } catch (retryError) {
        console.warn('Retry failed:', retryError.message);
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
