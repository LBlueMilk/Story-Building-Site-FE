import { StoryType } from '@/types/story';

export interface UserType {
  id: number;
  name?: string;
  email?: string;
  userCode?: string;
  isVerified?: boolean;
  createdAt?: string;
  loginProviders?: string[];
  stories?: StoryType[];
  deleted_at?: string | null;
}
