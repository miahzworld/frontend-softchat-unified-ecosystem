
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_verified?: boolean;
  points?: number;
  level?: string;
  role?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
}

export interface ExtendedUser extends User {
  username: string; // Making this required since we need it in multiple components
  name: string;
  avatar: string;
  points: number;
  level: string;
  role: string;
  profile?: UserProfile;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    is_verified: boolean;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read: boolean;
  sender?: {
    name: string;
    avatar: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
  unread_count: number;
  participant_profile?: {
    id: string;
    name: string;
    avatar: string;
    is_online: boolean;
  };
}

// Add User interface export
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

// Add Story interfaces
export interface Story {
  id: string;
  username: string;
  avatar: string;
  hasNewStory?: boolean;
  isUser: boolean;
}

export interface StoryContent {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export type UserLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";

// Add new types for P2P marketplace
export interface P2POffer {
  id: string;
  type: 'buy' | 'sell';
  crypto_amount: number;
  crypto_symbol: string;
  fiat_price: number;
  fiat_currency: string;
  min_order: number;
  max_order: number;
  payment_methods: string[];
  seller: {
    id: string;
    name: string;
    avatar: string;
    is_verified: boolean;
    rating: number;
    total_trades: number;
  };
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
}
