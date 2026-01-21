import axios from 'axios';

// 웹뷰 환경에서도 올바른 baseURL 설정
const getBaseURL = () => {
  // 환경 변수가 설정되어 있으면 사용
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 브라우저 환경에서는 현재 origin 사용
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 서버 사이드에서는 빈 문자열 (상대 경로)
  return '';
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
