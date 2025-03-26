import { StoryType } from '@/types/story';

export interface UserType {
    name?: string;
    email?: string;
    stories?: StoryType[];
  }