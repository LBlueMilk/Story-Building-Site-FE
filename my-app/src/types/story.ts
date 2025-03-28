// 精簡版（保留）
export interface StoryType {
  id: number;
  title: string;
}

// 對應後端 StoryResponseDto（完整）
export interface StoryResponse {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  creatorId: number;
  creatorName: string;
  creatorEmail: string;
  sharedUsers?: {
    email: string;
    name: string;
  }[];
}

