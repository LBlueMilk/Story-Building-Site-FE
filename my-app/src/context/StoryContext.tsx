'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { StoryResponse } from '@/types/story';
import { getStories } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';


interface StoryContextType {
  stories: StoryResponse[];
  setStories: (stories: StoryResponse[]) => void;
  storyLoading: boolean;
  setStoryLoading: (loading: boolean) => void;
  fetchStories: () => Promise<void>;
}

const StoryContext = createContext<StoryContextType>({
  stories: [],
  setStories: () => { },
  storyLoading: false,
  setStoryLoading: () => { },
  fetchStories: async () => { },
});

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [storyLoading, setStoryLoading] = useState(false);
  const { token, isReady } = useAuth();

  const fetchStories = async () => {
    try {
      setStoryLoading(true);
      const { data } = await getStories();
      setStories(data);
    } catch (err) {
      console.error("StoryContext 載入失敗", err);
    } finally {
      setStoryLoading(false);
    }
  };

  // 當 token 有效時才觸發取得故事資料
  useEffect(() => {
    if (token && isReady) {
      fetchStories();
    }
  }, [token, isReady]);


  return (
    <StoryContext.Provider value={{ stories, setStories, storyLoading, setStoryLoading, fetchStories }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);
