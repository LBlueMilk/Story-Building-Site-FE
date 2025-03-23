import api from './api';

interface StoryType {
  id: string;
  title: string;
}

interface UserType {
  name?: string;
  stories: StoryType[];
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserType;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface CreateStoryRequest {
  title: string;
  description?: string;
  isPublic: boolean;
}

export const login = (data: LoginRequest) => 
  api.post<LoginResponse>('/auth/login', data);

export const register = (data: RegisterRequest) => 
  api.post<LoginResponse>('/auth/register', data);

export const createStory = (data: CreateStoryRequest, token: string) =>
  api.post('/story', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });



