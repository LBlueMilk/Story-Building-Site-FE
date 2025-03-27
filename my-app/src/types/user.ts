import { StoryType } from '@/types/story';

export interface UserType {
  id: number;
  name?: string;
  email?: string;
  stories?: StoryType[];
}
