
import { useState, useEffect } from "react";
import { Story, StoryContent } from "@/types/user";
import { supabase } from "@/lib/supabase/client";
import { mockStories } from "@/data/mockFeedData";

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        // Try to fetch stories from supabase if the table exists
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('type', 'story')
          .limit(10);

        if (error || !data || data.length === 0) {
          // Fall back to mock data if there's an error or no data
          setStories(mockStories as unknown as Story[]);
        } else {
          // Transform the data to match the Story type
          const storiesData = data.map(item => ({
            id: item.id,
            username: item.username || 'user',
            avatar: item.avatar || '/placeholder.svg',
            hasNewStory: true,
            isUser: false
          }));
          
          setStories(storiesData);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        setStories(mockStories as unknown as Story[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  return { stories, isLoading };
};
