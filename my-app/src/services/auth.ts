import api from './api';
import { StoryResponse } from '@/types/story';
import { UserType } from '@/types/user'; 

interface StoryType {
  id: number;
  title: string;
}

// 已刪除的故事
export interface DeletedStoryResponse {
  id: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  deletedAt: string | null; // Only for deleted
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

interface UpdateProfileRequest {
  email?: string;
  name?: string;
}

interface UpdateProfileResponse {
  message: string;
}

interface GetProfileResponse {
  id: number;
  email: string;
  name: string;
  userCode: string;
  isVerified: boolean;
  createdAt: string;
  loginProviders: string[];
}

// 登入 API
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', data);

// 註冊 API
export const register = (data: RegisterRequest) =>
  api.post<LoginResponse>('/auth/register', data);

// 取得故事列表 API
export const createStory = (data: CreateStoryRequest) =>
  api.post('/story', data);

// 取得個人資料 API
export const getProfile = () =>
  api.get<GetProfileResponse>('/auth/profile');

// 更新個人資料 API
export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<UpdateProfileResponse>('/auth/update', data);

// 驗證密碼 API
export const verifyPassword = (password: string) => {
  return api.post('/auth/verify-password', { password });
};

// 已建立故事 API
export const getStories = () =>
  api.get<StoryResponse[]>('/story');

// 刪除故事 API
export const deleteStory = (id: number) =>
  api.delete(`/story/${id}`);

// 取得已刪除故事列表 API
export const getDeletedStories = () =>
  api.get<DeletedStoryResponse[]>('/story/deleted');

// 還原故事 API
export const restoreStory = (id: number) =>
  api.post(`/story/restore/${id}`);

// 改為呼叫 /story/shared/all，取得自己分享 & 被分享的所有故事
export const getSharedStories = async (): Promise<StoryResponse[]> => {
  const { data } = await api.get<StoryResponse[]>('/story/shared/all');
  return data;
};

// 刪除帳號（實際為標記延遲刪除）
export async function deleteAccount() {
  return api.delete('/auth/delete-account');
}

// 還原帳號
export const restoreAccount = () => {
  return api.put('/auth/restore-account') 
}

