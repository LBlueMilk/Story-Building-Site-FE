import api from './api';
import { StoryResponse } from '@/types/story';
import { UserType } from '@/types/user';
import Cookies from 'js-cookie'

// 已刪除的故事
export interface DeletedStoryResponse {
  id: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  deletedAt: string | null; // Only for deleted
}

export function logout(): void {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
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

interface LoginResult {
  accessToken: string
  refreshToken: string
  user: UserType
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface VerifyPasswordResponse {
  message: string;
}


// 登入 API
export const login = async (data: LoginRequest): Promise<LoginResult> => {
  const res = await api.post<LoginResult>('/auth/login', data)
  const { accessToken, refreshToken, user } = res.data

  Cookies.set('accessToken', accessToken, { path: '/', sameSite: 'strict' })
  Cookies.set('refreshToken', refreshToken, { path: '/', sameSite: 'strict' })

  return { accessToken, refreshToken, user }
}

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
export const verifyPassword = async (password: string): Promise<VerifyPasswordResponse> => {
  try {
    const res = await api.post<VerifyPasswordResponse>('/auth/verify-password', { password });
    return res.data;
  } catch (err) {
    // 確保錯誤會傳遞給呼叫方的 catch 區塊
    throw err;
  }
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

// 使用 Refresh Token 換取新的 Access Token（自動續登機制）
// - 前端 accessToken 過期時觸發（由 Axios interceptor 自動呼叫）
// - 提供 refreshToken 給後端，若合法則回傳新的 accessToken + refreshToken
// - 回傳格式為：{ accessToken: string, refreshToken: string }
// 若 refreshToken 無效或過期，後端會回傳 401，並要求重新登入
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const res = await api.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
  return res.data;
};



