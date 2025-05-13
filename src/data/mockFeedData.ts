// Fix the import and add proper types
import { AppUser } from '@/types/user';
import { Story } from '@/types/user';

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

export const mockStories = [
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
] as Story[];

export const mockComments = [
  {
    id: '1',
    postId: '1',
    user: {
      id: '1',
      username: 'johndoe',
      avatar: '/placeholder.svg',
    },
    text: 'Great post!',
    timestamp: '2023-10-26T12:00:00Z',
  },
  {
    id: '2',
    postId: '1',
    user: {
      id: '2',
      username: 'janesmith',
      avatar: '/placeholder.svg',
    },
    text: 'I agree!',
    timestamp: '2023-10-26T12:05:00Z',
  },
  {
    id: '3',
    postId: '2',
    user: {
      id: '3',
      username: 'alicejohnson',
      avatar: '/placeholder.svg',
    },
    text: 'Interesting perspective.',
    timestamp: '2023-10-26T12:10:00Z',
  },
];
