'use client';

import { createContext, useContext, useState } from 'react';
import { StoryResponse } from '../services/auth';

export interface StoryType {
    id: string;
    title: string;
  }  

interface StoryContextType {
  stories: StoryResponse[];
  setStories: (stories: StoryResponse[]) => void;
  storyLoading: boolean;
  setStoryLoading: (loading: boolean) => void;
}

const StoryContext = createContext<StoryContextType>({
  stories: [],
  setStories: () => {},
  storyLoading: false,
  setStoryLoading: () => {},
});

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [storyLoading, setStoryLoading] = useState(false);

  return (
    <StoryContext.Provider value={{ stories, setStories, storyLoading, setStoryLoading }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);
