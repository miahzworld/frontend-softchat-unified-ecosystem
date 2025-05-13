import { PostType } from "@/types/post";
import { User, Story, PostComment } from "@/types/user";

export interface Story {
  id: string;
  username: string;
  avatar: string;
  hasNewStory?: boolean;
  isUser: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  video_url?: string;
  type: PostType;
  location?: string | null;
  tags?: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  softpoints?: number;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "john.doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: true,
  },
  {
    id: "2",
    name: "Sarah Smith",
    username: "sarah.smith",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    verified: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    username: "mike.johnson",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    verified: true,
  },
  {
    id: "4",
    name: "Emma Davis",
    username: "emma.davis",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    verified: false,
  },
  {
    id: "5",
    name: "Alex Wilson",
    username: "alex.wilson",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    verified: true,
  },
  {
    id: "6",
    name: "Lily Taylor",
    username: "lily.taylor",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    verified: false,
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    author: mockUsers[0],
    content: "Enjoying a sunny day at the park! ☀️ #parklife #sunnyday",
    image: "https://images.unsplash.com/photo-1560762484-81b4a19b725b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "text",
    location: "Central Park",
    tags: ["parklife", "sunnyday"],
    createdAt: "2024-01-28T12:00:00Z",
    likes: 150,
    comments: 30,
    shares: 10,
    softpoints: 5,
  },
  {
    id: "2",
    author: mockUsers[1],
    content: "Just finished a great workout! 💪 #fitness #healthylifestyle",
    type: "text",
    location: null,
    tags: ["fitness", "healthylifestyle"],
    createdAt: "2024-01-27T18:30:00Z",
    likes: 220,
    comments: 45,
    shares: 15,
    softpoints: 8,
  },
  {
    id: "3",
    author: mockUsers[2],
    content: "Trying out a new recipe tonight! 👨‍🍳 #cooking #foodie",
    type: "text",
    location: null,
    tags: ["cooking", "foodie"],
    createdAt: "2024-01-26T20:00:00Z",
    likes: 180,
    comments: 35,
    shares: 12,
    softpoints: 3,
  },
  {
    id: "4",
    author: mockUsers[3],
    content: "Exploring the city streets! 🏙️ #citylife #travel",
    image: "https://images.unsplash.com/photo-1519828233628-9e4968035101?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "text",
    location: "New York City",
    tags: ["citylife", "travel"],
    createdAt: "2024-01-25T15:45:00Z",
    likes: 250,
    comments: 50,
    shares: 20,
    softpoints: 10,
  },
  {
    id: "5",
    author: mockUsers[4],
    content: "Enjoying a cup of coffee on a rainy day. ☕ #coffee #rainyday",
    type: "text",
    location: null,
    tags: ["coffee", "rainyday"],
    createdAt: "2024-01-24T09:15:00Z",
    likes: 120,
    comments: 25,
    shares: 8,
    softpoints: 2,
  },
  {
    id: "6",
    author: mockUsers[5],
    content: "Reading a good book in my cozy corner. 📚 #reading #cozy",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "text",
    location: null,
    tags: ["reading", "cozy"],
    createdAt: "2024-01-23T16:20:00Z",
    likes: 190,
    comments: 40,
    shares: 14,
    softpoints: 7,
  },
];

export const mockComments: PostComment[] = [
  {
    id: "c1",
    post_id: "1",
    user_id: "1",
    content: "This is such a beautiful place! Where exactly is this park?",
    created_at: "2024-01-28T12:30:00Z",
    user: {
      name: "Sarah Smith",
      username: "sarah.smith",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      is_verified: false
    }
  },
  {
    id: "c2",
    post_id: "1",
    user_id: "3",
    content: "I was there last weekend! The weather was perfect.",
    created_at: "2024-01-28T13:15:00Z",
    user: {
      name: "Mike Johnson",
      username: "mike.johnson",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      is_verified: true
    }
  },
  {
    id: "c3",
    post_id: "1",
    user_id: "4",
    content: "Great shot! What camera did you use?",
    created_at: "2024-01-28T14:00:00Z",
    user: {
      name: "Emma Davis",
      username: "emma.davis",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      is_verified: false
    }
  }
];

export const mockStories: Story[] = [
  {
    id: "1",
    username: "You",
    avatar: "/placeholder.svg",
    hasNewStory: true,
    isUser: true,
  },
  {
    id: "2",
    username: "john.doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    hasNewStory: true,
    isUser: false,
  },
  {
    id: "3",
    username: "sarah.smith",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    hasNewStory: true,
    isUser: false,
  },
  {
    id: "4",
    username: "mike.johnson",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    isUser: false,
  },
  {
    id: "5",
    username: "emma.davis",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    hasNewStory: true,
    isUser: false,
  },
  {
    id: "6",
    username: "alex.wilson",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    isUser: false,
  },
  {
    id: "7",
    username: "lily.taylor",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    hasNewStory: true,
    isUser: false,
  }
];
