
import { useState, useEffect, useCallback } from "react";
import { ContentItem, VideoItem, AdItem } from "@/types/video";
import { mockAdData, mockVideos } from "@/data/mockVideosData";
import { supabase } from "@/lib/supabase/client";

export const useVideoData = () => {
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch videos from Supabase
  useEffect(() => {
    fetchVideos();
    
    // Subscribe to new video posts
    const videosSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts',
          filter: 'type=eq.video'
        }, 
        payload => {
          // Handle new video post
          console.log('New video posted:', payload);
          refreshVideos(); // Refresh videos when a new one is posted
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(videosSubscription);
    };
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    
    try {
      // Check if video_url column exists in posts table
      const { data: columnCheck, error: columnError } = await supabase
        .rpc('check_column_exists', { 
          table_name: 'posts', 
          column_name: 'video_url' 
        });
        
      const videoUrlExists = columnCheck === true;
      
      if (columnError || !videoUrlExists) {
        // If video_url doesn't exist or error, use mock data
        console.log("Using mock video data because video_url column doesn't exist or error occurred:", columnError);
        const itemsWithAd = [
          ...mockVideos.slice(0, 2),
          { isAd: true, ad: mockAdData } as AdItem,
          ...mockVideos.slice(2)
        ];
        setAllItems(itemsWithAd);
        setIsLoading(false);
        return;
      }
      
      // Fetch video posts from Supabase
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          video_url,
          tags,
          softpoints,
          user_id,
          created_at,
          profiles:user_id(name, username, avatar, is_verified)
        `)
        .eq('type', 'video')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
      
      if (!posts || posts.length === 0) {
        // If no videos in database, use mock data
        const itemsWithAd = [
          ...mockVideos.slice(0, 2),
          { isAd: true, ad: mockAdData } as AdItem,
          ...mockVideos.slice(2)
        ];
        setAllItems(itemsWithAd);
      } else {
        // Transform posts into VideoItem format
        // Check if posts is actually an error object
        if ('code' in posts || 'message' in posts) {
          console.error("Error in posts data:", posts);
          // Use mock data as fallback
          const itemsWithAd = [
            ...mockVideos.slice(0, 2),
            { isAd: true, ad: mockAdData } as AdItem,
            ...mockVideos.slice(2)
          ];
          setAllItems(itemsWithAd);
          return;
        }
        
        // If it's actual data, process it
        const videoItems: VideoItem[] = posts.map((post: any) => {
          const profile = post.profiles as any;
          
          return {
            id: post.id,
            url: post.video_url || "",
            thumbnail: (post.video_url || "") + '?thumbnail=true',
            description: post.content,
            likes: Math.floor(Math.random() * 100) + 5, // Mock data for now
            comments: Math.floor(Math.random() * 30), // Mock data for now
            shares: Math.floor(Math.random() * 20), // Mock data for now
            tags: post.tags || [],
            softpoints: post.softpoints || 0,
            author: {
              id: post.user_id,
              name: profile?.name || 'Unknown User',
              username: profile?.username || 'user',
              avatar: profile?.avatar || '/placeholder.svg',
              verified: profile?.is_verified || false,
            },
            isFollowing: false // This would need a real check from followers table
          };
        });
        
        // Insert an ad after every few videos
        const itemsWithAd: ContentItem[] = [];
        videoItems.forEach((video, index) => {
          itemsWithAd.push(video);
          // Add an ad after every 3rd video
          if ((index + 1) % 3 === 0) {
            itemsWithAd.push({ isAd: true, ad: mockAdData } as AdItem);
          }
        });
        
        setAllItems(itemsWithAd);
      }
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      // Fall back to mock data on error
      const itemsWithAd = [
        ...mockVideos.slice(0, 2),
        { isAd: true, ad: mockAdData } as AdItem,
        ...mockVideos.slice(2)
      ];
      setAllItems(itemsWithAd);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchVideos();
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    allItems,
    isLoading,
    refreshVideos,
  };
};
