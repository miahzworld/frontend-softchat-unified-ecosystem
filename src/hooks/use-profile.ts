import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Post } from '@/components/feed/PostCard';
import { Product } from '@/types/marketplace';
import { ExtendedUser, UserProfile } from '@/types/user';
import { supabase } from '@/lib/supabase/client';
import {
  getUserByUsername,
  getFollowersCount,
  getFollowingCount,
  isFollowing as checkIsFollowing,
  toggleFollow as toggleFollowStatus,
  getUserPosts,
  getUserProducts
} from '@/services/profileService';

interface UseProfileProps {
  username?: string;
}

export const useProfile = ({ username }: UseProfileProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = !username || (user && profileUser && user.id === profileUser.id);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);

      try {
        if ((!username && user) || (username && user?.profile?.username === username)) {
          setProfileUser(user);
          await fetchUserData(user.id);
          return;
        }

        if (username) {
          const profileData = await getUserByUsername(username);

          if (profileData) {
            const enhancedProfile = {
              ...profileData,
              id: profileData.user_id
            };
            const extendedUser = transformUser(enhancedProfile) as ExtendedUser;
            setProfileUser(extendedUser);
            await fetchUserData(profileData.user_id);
          } else {
            createMockProfile(username);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (username) {
          createMockProfile(username);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user]);

  const fetchUserData = async (userId: string) => {
    try {
      const followers = await getFollowersCount(userId);
      const following = await getFollowingCount(userId);

      setFollowerCount(followers);
      setFollowingCount(following);

      if (user && user.id !== userId) {
        const following = await checkIsFollowing(user.id, userId);
        setIsFollowing(following);
      }

      try {
        const postsData = await getUserPosts(userId);
        const productsData = await getUserProducts(userId);

        if (postsData && postsData.length > 0) {
          setPosts(formatPosts(postsData));
        } else {
          createMockPosts();
        }

        if (productsData && productsData.length > 0) {
          setProducts(formatProducts(productsData));
        } else {
          createMockProducts(userId);
        }
      } catch (error) {
        console.error("Error fetching user content:", error);
        createMockPosts();
        createMockProducts(userId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFollowerCount(Math.floor(Math.random() * 1000) + 100);
      setFollowingCount(Math.floor(Math.random() * 500) + 50);
      createMockPosts();
      createMockProducts(userId);
    }
  };

  const formatPosts = (postsData: any[]): Post[] => {
    return postsData.map(post => ({
      id: post.id,
      content: post.content,
      image: post.image_url,
      createdAt: new Date(post.created_at).toLocaleDateString(),
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: 0,
      author: {
        name: post.profiles?.full_name || post.profiles?.username || 'Unknown',
        username: post.profiles?.username || 'user',
        avatar: post.profiles?.avatar_url || '/placeholder.svg',
        verified: post.profiles?.is_verified || false
      }
    }));
  };

  const formatProducts = (productsData: any[]): Product[] => {
    return productsData.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discount_price,
      image: product.image_url || '/placeholder.svg',
      category: product.category || 'General',
      rating: product.rating || 4.5,
      reviewCount: product.review_count || 0,
      inStock: product.in_stock || true,
      isNew: new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      isFeatured: product.is_featured || false,
      isSponsored: product.is_sponsored || false,
      sellerId: product.seller_id,
      sellerName: product.profiles?.full_name || product.profiles?.username || 'User',
      sellerAvatar: product.profiles?.avatar_url || '/placeholder.svg',
      sellerVerified: product.profiles?.is_verified || false,
      createdAt: product.created_at,
      updatedAt: product.updated_at || product.created_at
    }));
  };

  const transformUser = (userData: any): ExtendedUser => {
    if (!userData) return null as unknown as ExtendedUser;

    // Add username property from profile or user_metadata
    const username = userData.profile?.username || 
                  userData.user_metadata?.username || 
                  userData.email?.split('@')[0] || 
                  'user';

    return {
      ...userData,
      username,  // Add the username property
      name: userData.name || userData.user_metadata?.name || username,
      avatar: userData.avatar || userData.user_metadata?.avatar || '/placeholder.svg',
      points: userData.profile?.points || 0,
      level: userData.profile?.level || 'bronze',
      role: userData.profile?.role || 'user',
    } as ExtendedUser;
  };

  const createMockProfile = (username: string) => {
    const mockUserId = "mock-" + Date.now();
    const mockUser = {
      id: mockUserId,
      email: `${username}@example.com`,
      name: username,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      points: Math.floor(Math.random() * 5000) + 500,
      level: 'silver',
      role: 'user',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      user_metadata: {
        name: username,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      },
      profile: {
        id: mockUserId,
        full_name: username,
        username: username,
        avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
        bio: "This is a mock user profile for demonstration purposes.",
        is_verified: Math.random() > 0.7,
        points: Math.floor(Math.random() * 5000) + 500,
        level: 'silver',
        role: 'user',
      },
      app_metadata: {},
      aud: "authenticated"
    } as ExtendedUser;

    setProfileUser(mockUser);

    setFollowerCount(Math.floor(Math.random() * 1000) + 100);
    setFollowingCount(Math.floor(Math.random() * 500) + 50);

    createMockPosts();
    createMockProducts(mockUser.id);
  };

  const createMockPosts = () => {
    if (!profileUser) return;

    const mockPosts: Post[] = [
      {
        id: "mock-1",
        author: {
          name: profileUser.name || "User",
          username: profileUser.profile?.username || "user",
          avatar: profileUser.avatar || "/placeholder.svg",
          verified: profileUser.profile?.is_verified || false,
        },
        content: "Just made my first crypto trade on Softchat! The platform makes it so easy to get started with cryptocurrency trading. #crypto #softchat",
        createdAt: "10 minutes ago",
        likes: 24,
        comments: 3,
        shares: 1,
      },
      {
        id: "mock-2",
        author: {
          name: profileUser.name || "User",
          username: profileUser.profile?.username || "user",
          avatar: profileUser.avatar || "/placeholder.svg",
          verified: profileUser.profile?.is_verified || false,
        },
        content: "Working on a new project using React and TypeScript. Loving the developer experience so far!",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
        createdAt: "2 days ago",
        likes: 68,
        comments: 5,
        shares: 2,
      },
      {
        id: "mock-3",
        author: {
          name: profileUser.name || "User",
          username: profileUser.profile?.username || "user",
          avatar: profileUser.avatar || "/placeholder.svg",
          verified: profileUser.profile?.is_verified || false,
        },
        content: "Beautiful day for a hike! 🏞️ #outdoors #nature",
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop",
        createdAt: "1 week ago",
        likes: 142,
        comments: 12,
        shares: 5,
        liked: true,
      },
    ];

    setPosts(mockPosts);
  };

  const createMockProducts = (userId: string) => {
    if (!profileUser) return;

    const mockProducts: Product[] = [
      {
        id: "mock-1",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
        category: "Electronics",
        rating: 4.8,
        reviewCount: 124,
        inStock: true,
        isNew: true,
        sellerId: userId,
        sellerName: profileUser.name || "User",
        sellerAvatar: profileUser.avatar || "/placeholder.svg",
        sellerVerified: profileUser.profile?.is_verified || false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mock-2",
        name: "Handcrafted Wooden Watch",
        description: "Elegant wooden watch with premium leather strap",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=2788&auto=format&fit=crop",
        category: "Fashion",
        rating: 4.6,
        reviewCount: 46,
        inStock: true,
        sellerId: userId,
        sellerName: profileUser.name || "User",
        sellerAvatar: profileUser.avatar || "/placeholder.svg",
        sellerVerified: profileUser.profile?.is_verified || false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mock-3",
        name: "Digital Marketing Course Bundle",
        description: "Complete digital marketing masterclass with 50+ hours of content",
        price: 149.00,
        discountPrice: 99.00,
        image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=2070&auto=format&fit=crop",
        category: "Courses",
        rating: 4.9,
        reviewCount: 215,
        inStock: true,
        isFeatured: true,
        sellerId: userId,
        sellerName: profileUser.name || "User",
        sellerAvatar: profileUser.avatar || "/placeholder.svg",
        sellerVerified: profileUser.profile?.is_verified || false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setProducts(mockProducts);
  };

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow this user",
      });
      return;
    }

    if (!profileUser) return;

    try {
      setIsFollowing(prev => !prev);

      if (isFollowing) {
        setFollowerCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profileUser.name}`,
        });
      } else {
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following",
          description: `You are now following ${profileUser.name}`,
        });
      }

      if (user.id && profileUser.id) {
        await toggleFollowStatus(user.id, profileUser.id, isFollowing);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({
        title: "Error",
        description: "Could not update follow status",
        variant: "destructive",
      });
      setIsFollowing(prev => !prev);
      setFollowerCount(followerCount);
    }
  };

  const handleAddToCart = (productId: string) => {
    toast({
      title: "Added to cart",
      description: "Product added to your cart",
    });
  };

  const handleAddToWishlist = (productId: string) => {
    toast({
      title: "Added to wishlist",
      description: "Product added to your wishlist",
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== productId));

      toast({
        title: "Product deleted",
        description: "Your product has been deleted",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Could not delete product",
        variant: "destructive",
      });
    }
  };

  return {
    profileUser,
    isLoading,
    isOwnProfile,
    posts,
    products,
    isFollowing,
    followerCount,
    followingCount,
    toggleFollow,
    handleAddToCart,
    handleAddToWishlist,
    handleDeleteProduct,
  };
};
