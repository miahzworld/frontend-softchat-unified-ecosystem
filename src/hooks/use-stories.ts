
import { useState, useEffect } from 'react';
import { Story } from '@/types/user';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockStories } from "@/data/mockFeedData";

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const { data: storyPosts, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, avatar)
          `)
          .eq('type', 'story')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        if (storyPosts && Array.isArray(storyPosts)) {
          const mappedStories: Story[] = storyPosts.map((post) => {
            const profile = post.profiles as any;
            return {
              id: post.id,
              username: profile?.username || 'user',
              avatar: profile?.avatar || '/placeholder.svg',
              hasNewStory: true, 
              isUser: post.user_id === user?.id
            };
          });
  
          setStories(mappedStories);
        } else {
          setStories(mockStories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        setStories(mockStories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [user]);

  return { stories, isLoading };
};
