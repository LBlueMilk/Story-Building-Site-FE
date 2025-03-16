import api from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

export const login = (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data);

export const register = (data: RegisterRequest) => api.post('/auth/register', data);
