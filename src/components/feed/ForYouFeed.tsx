
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedPostCard from "./EnhancedPostCard";
import CommentSection from "./CommentSection";
import { Sparkles, Zap, TrendingUp } from "lucide-react";
import { Post } from "./PostCard";
import { PostComment } from "@/types/user";
import { useNotification } from "@/hooks/use-notification";
import { mockPosts, mockComments } from "@/data/mockFeedData";
import FeedSkeleton from "./FeedSkeleton";

const ForYouFeed = () => {
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "new">("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const notification = useNotification();

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, we would fetch personalized posts based on user preferences
        // For now, we'll just use mock data with a delayed response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate different content for each tab
        let postsToShow;
        if (activeTab === "foryou") {
          // For personalized feed, we'd use an algorithm that considers user interests and behavior
          postsToShow = [...mockPosts].sort(() => Math.random() - 0.5);
        } else if (activeTab === "trending") {
          // For trending, we'd sort by engagement metrics
          postsToShow = [...mockPosts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
        } else {
          // For new, we'd sort by date
          postsToShow = [...mockPosts].sort(() => Math.random() - 0.5);
          // In a real app, we'd use: .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setPosts(postsToShow);
        
        // Set up mock comments
        const comments: Record<string, PostComment[]> = {};
        postsToShow.forEach(post => {
          comments[post.id] = post.id === "1" ? mockComments : [];
        });
        setPostComments(comments);
        
      } catch (error) {
        console.error("Error loading posts:", error);
        notification.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, [activeTab, notification]);

  const handleAddComment = (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    
    // In a real app, we'd send this to an API
    const newComment: PostComment = {
      id: `new-${Date.now()}`,
      post_id: postId,
      user_id: "current-user",
      content: commentText,
      created_at: new Date().toISOString(),
      user: {
        name: "You",
        username: "you",
        avatar: "/placeholder.svg",
        is_verified: false,
      }
    };
    
    // Update local state
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    
    setPosts(prev => prev.map(post => 
      post.id === postId ? {...post, comments: post.comments + 1} : post
    ));
    
    notification.success("Comment added");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="foryou" className="flex gap-2 items-center">
                <Sparkles className="h-4 w-4" />
                <span>For You</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex gap-2 items-center">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex gap-2 items-center">
                <Zap className="h-4 w-4" />
                <span>New</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <FeedSkeleton />
      ) : (
        posts.map((post) => (
          <div key={post.id} className="space-y-2">
            <EnhancedPostCard post={post} />
            <CommentSection
              postId={post.id}
              comments={postComments[post.id] || []}
              onAddComment={handleAddComment}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ForYouFeed;
