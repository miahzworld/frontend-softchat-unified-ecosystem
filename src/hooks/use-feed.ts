
import { useState, useEffect, useCallback } from "react";
import { Post } from "@/components/feed/PostCard";
import { PostComment } from "@/types/user";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/contexts/AuthContext";
import { mockPosts, mockComments } from "@/data/mockFeedData";
import { CreatePost } from "@/types/post";

type CreatePostParams = {
  content: string;
  mediaUrl?: string;
  location?: string | null;
  taggedUsers?: string[];
};

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const notification = useNotification();
  const { user } = useAuth();

  const PAGE_SIZE = 5; // Number of posts per page

  // Format date as "X time ago"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Load posts with pagination
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate paginated data
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedPosts = mockPosts.slice(0, endIndex);

      setPosts(paginatedPosts);
      setHasMore(endIndex < mockPosts.length);

      const initialComments: Record<string, PostComment[]> = {};
      paginatedPosts.forEach(post => {
        initialComments[post.id] = post.id === "1" ? mockComments : [];
      });
      setPostComments(initialComments);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [page]);

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Enhanced post creation with all metadata
  const handleCreatePost = useCallback(({
    content,
    mediaUrl,
    location,
    taggedUsers = []
  }: CreatePostParams) => {
    const newPost: Post = {
      id: `new-${Date.now()}`,
      author: {
        name: user?.name || "John Doe",
        username: user?.profile?.username || "johndoe",
        avatar: user?.avatar || "/placeholder.svg",
        verified: !!user?.profile?.is_verified,
      },
      content,
      image: mediaUrl,
      location: location || null,
      taggedUsers: taggedUsers || null,
      createdAt: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
    };

    setPosts(prev => [newPost, ...prev]);

    // Initialize empty comments for the new post
    setPostComments(prev => ({
      ...prev,
      [newPost.id]: []
    }));

    notification.success("Post created successfully");
  }, [user, notification]);

  const handleAddComment = useCallback((postId: string, commentText: string) => {
    if (!commentText || !commentText.trim()) return;

    const newComment: PostComment = {
      id: `new-${Date.now()}`,
      post_id: postId,
      user_id: user?.id || "current-user",
      content: commentText,
      created_at: new Date().toISOString(),
      user: {
        name: user?.name || "You",
        username: user?.profile?.username || "you",
        avatar: user?.avatar || "/placeholder.svg",
        is_verified: !!user?.profile?.is_verified
      }
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: post.comments + 1 }
        : post
    ));

    notification.success("Comment added");
  }, [user, notification]);

  return {
    posts,
    isLoading,
    postComments,
    hasMore,
    loadMorePosts,
    handleCreatePost,
    handleAddComment
  };
};
