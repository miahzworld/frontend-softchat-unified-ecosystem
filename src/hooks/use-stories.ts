
import { useState, useEffect } from "react";
import { Story, StoryContent } from "@/types/user";
import { mockStories } from "@/data/mockFeedData";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyContent, setStoryContent] = useState<StoryContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStories() {
      try {
        // NOTE: Instead of using a non-existent "stories" table, we can use the posts table
        // and filter for a specific type or tag that indicates it's a story
        // For now, we'll use mock data since stories functionality isn't fully implemented
        
        // This is the CORRECT implementation once you have a stories feature:
        // const { data, error } = await supabase
        //  .from('posts')  // Using posts table instead of non-existent stories
        //  .select('*')
        //  .eq('type', 'story')  // Filter for story type posts

        // if (error) throw error;
        
        // For now, we'll use mock data
        setStories(mockStories);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setStories(mockStories); // Fallback to mock data
        setIsLoading(false);
      }
    }

    fetchStories();
  }, []);

  return {
    stories,
    activeStory,
    storyContent,
    viewStory: (story: Story) => {
      setActiveStory(story);
      // Typically you'd fetch the content of the story here
      setStoryContent([
        { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60' },
      ]);
    },
    closeStory: () => {
      setActiveStory(null);
      setStoryContent([]);
    },
    isLoading
  };
}
