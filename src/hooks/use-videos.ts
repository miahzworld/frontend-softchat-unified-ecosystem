
import { useState, useCallback, useEffect } from "react";
import { ContentItem, VideoItem, AdItem } from "@/types/video";
import { mockAdData } from "@/data/mockVideosData";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useVideos = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch videos from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      
      try {
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
            profiles(name, username, avatar, is_verified)
          `)
          .eq('type', 'video')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        if (!posts || posts.length === 0) {
          // If no videos in database, use mock data
          const { mockVideos } = await import('@/data/mockVideosData');
          const itemsWithAd = [
            ...mockVideos.slice(0, 2),
            { isAd: true, ad: mockAdData } as AdItem,
            ...mockVideos.slice(2)
          ];
          setAllItems(itemsWithAd);
        } else {
          // Transform posts into VideoItem format
          const videoItems: VideoItem[] = posts.map(post => {
            const profile = post.profiles as any;
            return {
              id: post.id,
              url: post.video_url,
              thumbnail: post.video_url + '?thumbnail=true',
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
      } catch (error) {
        console.error("Error fetching videos:", error);
        // Fall back to mock data on error
        const { mockVideos } = await import('@/data/mockVideosData');
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
          // You'd typically fetch the new video details and add it to state
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(videosSubscription);
    };
  }, []);

  const handleNextVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < allItems.length - 1 ? prev + 1 : 0
    );
  }, [allItems.length]);

  const handlePrevVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : allItems.length - 1
    );
  }, [allItems.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      handleNextVideo();
    } else if (touchEnd - touchStart > 50) {
      // Swipe down
      handlePrevVideo();
    }
  }, [touchStart, touchEnd, handleNextVideo, handlePrevVideo]);

  const getCurrentItem = (): ContentItem | null => {
    if (isLoading || allItems.length === 0) return null;
    return allItems[currentIndex % allItems.length];
  };

  const refreshVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Re-fetch videos (same logic as in useEffect)
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
          profiles(name, username, avatar, is_verified)
        `)
        .eq('type', 'video')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Transform posts into VideoItem format
      const videoItems: VideoItem[] = posts.map(post => {
        const profile = post.profiles as any;
        return {
          id: post.id,
          url: post.video_url,
          thumbnail: post.video_url + '?thumbnail=true',
          description: post.content,
          likes: Math.floor(Math.random() * 100) + 5, 
          comments: Math.floor(Math.random() * 30),
          shares: Math.floor(Math.random() * 20),
          tags: post.tags || [],
          softpoints: post.softpoints || 0,
          author: {
            id: post.user_id,
            name: profile?.name || 'Unknown User',
            username: profile?.username || 'user',
            avatar: profile?.avatar || '/placeholder.svg',
            verified: profile?.is_verified || false,
          },
          isFollowing: false
        };
      });
      
      // Insert an ad after every few videos
      const itemsWithAd: ContentItem[] = [];
      videoItems.forEach((video, index) => {
        itemsWithAd.push(video);
        if ((index + 1) % 3 === 0) {
          itemsWithAd.push({ isAd: true, ad: mockAdData } as AdItem);
        }
      });
      
      setAllItems(itemsWithAd);
    } catch (error) {
      console.error("Error refreshing videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentItem: getCurrentItem(),
    handleNextVideo,
    handlePrevVideo,
    allItems,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    currentIndex,
    isLoading,
    refreshVideos
  };
};
