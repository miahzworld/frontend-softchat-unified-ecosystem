
// Fix the import and add proper types
import { AppUser, PostComment } from '@/types/user';
import { Story } from '@/types/user';
import { Post } from '@/components/feed/PostCard';

export const mockUsers: AppUser[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    avatar: '/placeholder.svg',
    verified: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    avatar: '/placeholder.svg',
    verified: false,
  },
  {
    id: '3',
    name: 'Alice Johnson',
    username: 'alicejohnson',
    avatar: '/placeholder.svg',
    verified: true,
  },
];

export const mockStories: Story[] = [
  {
    id: '1',
    username: 'johndoe',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: false
  },
  {
    id: '2',
    username: 'janesmith',
    avatar: '/placeholder.svg',
    hasNewStory: false,
    isUser: false
  },
  {
    id: '3',
    username: 'alicejohnson',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: false
  },
  {
    id: '4',
    username: 'bobwilliams',
    avatar: '/placeholder.svg',
    hasNewStory: false,
    isUser: false
  },
  {
    id: '5',
    username: 'sarahbrown',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: false
  },
  {
    id: '6',
    username: 'davidlee',
    avatar: '/placeholder.svg',
    hasNewStory: false,
    isUser: false
  },
  {
    id: '7',
    username: 'emilywilson',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: false
  },
  {
    id: '8',
    username: 'michaelee',
    avatar: '/placeholder.svg',
    hasNewStory: false,
    isUser: false
  },
  {
    id: '9',
    username: 'lindajones',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: false
  },
  {
    id: '10',
    username: 'williamdavis',
    avatar: '/placeholder.svg',
    hasNewStory: false,
    isUser: false
  },
  {
    id: '11',
    username: 'you',
    avatar: '/placeholder.svg',
    hasNewStory: true,
    isUser: true
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Just launched our new AI-powered feature! Check it out!',
    createdAt: '2h ago',
    likes: 24,
    comments: 5,
    shares: 2,
    author: {
      name: 'Sarah Johnson',
      username: 'sarahj',
      avatar: '/placeholder.svg',
      verified: true,
    },
  },
  {
    id: '2',
    content: 'Excited to announce that we've raised $5M in seed funding!',
    createdAt: '5h ago',
    likes: 142,
    comments: 36,
    shares: 28,
    author: {
      name: 'David Chen',
      username: 'davidc',
      avatar: '/placeholder.svg',
      verified: false,
    },
  },
  {
    id: '3',
    content: 'What are your favorite productivity tools for remote work?',
    createdAt: '8h ago',
    likes: 56,
    comments: 43,
    shares: 5,
    author: {
      name: 'Alex Rivera',
      username: 'alexr',
      avatar: '/placeholder.svg',
      verified: false,
    },
  },
];

export const mockComments: PostComment[] = [
  {
    id: '1',
    post_id: '1',
    user_id: '1',
    content: 'Great post!',
    created_at: '2023-10-26T12:00:00Z',
    user: {
      name: 'John Doe',
      username: 'johndoe',
      avatar: '/placeholder.svg',
      is_verified: true
    }
  },
  {
    id: '2',
    post_id: '1',
    user_id: '2',
    content: 'I agree!',
    created_at: '2023-10-26T12:05:00Z',
    user: {
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: '/placeholder.svg',
      is_verified: false
    }
  },
  {
    id: '3',
    post_id: '2',
    user_id: '3',
    content: 'Interesting perspective.',
    created_at: '2023-10-26T12:10:00Z',
    user: {
      name: 'Alice Johnson',
      username: 'alicejohnson',
      avatar: '/placeholder.svg',
      is_verified: true
    }
  },
];
