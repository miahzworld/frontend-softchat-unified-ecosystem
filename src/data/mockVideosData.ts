
import { VideoItem, AdData } from "@/types/video";

export const mockAdData: AdData = {
  id: "ad1",
  title: "Premium Headphones",
  description: "Experience high-quality sound with our premium noise-cancelling headphones",
  cta: "Shop Now",
  image: "https://i.imgur.com/MDchpyC.jpg",
  url: "/marketplace",
  sponsor: "SoundWave Audio"
};

export const mockVideos: VideoItem[] = [
  {
    id: "1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4",
    description: "Showing off my new silver makeup look! ✨ #beauty #makeup",
    likes: 128,
    comments: 32,
    shares: 16,
    tags: ["beauty", "makeup", "silver"],
    author: {
      id: "user1",
      name: "Sophia Styles",
      username: "sophiastyles",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      verified: true,
    },
    isFollowing: false,
    softpoints: 15
  },
  {
    id: "2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    description: "The ocean is so peaceful today 🌊 #ocean #waves #nature",
    likes: 256,
    comments: 42,
    shares: 28,
    tags: ["ocean", "waves", "nature"],
    author: {
      id: "user2", // Added ID
      name: "Ocean Explorer",
      username: "oceanlover",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: false,
    },
    isFollowing: true,
    softpoints: 8
  },
  {
    id: "3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    description: "Spring is finally here! Look at these beautiful flowers 🌸 #spring #flowers #nature",
    likes: 432,
    comments: 67,
    shares: 41,
    tags: ["spring", "flowers", "nature"],
    author: {
      id: "user3", // Added ID
      name: "Flora Nature",
      username: "floranature",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      verified: true,
    },
    isFollowing: false,
    softpoints: 20
  },
  {
    id: "4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-down-a-mountain-41576-large.mp4",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-down-a-mountain-41576-large.mp4",
    description: "Road trip through the mountains! 🏔️ #travel #mountains #roadtrip",
    likes: 189,
    comments: 24,
    shares: 18,
    tags: ["travel", "mountains", "roadtrip"],
    author: {
      id: "user4", // Added ID
      name: "Adventure Seeker",
      username: "roadtripper",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      verified: false,
    },
    isFollowing: false,
    softpoints: 5
  },
  {
    id: "5",
    url: "https://assets.mixkit.co/videos/preview/mixkit-serving-fresh-spicy-curry-with-go-pro-type-of-perspective-4838-large.mp4",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-serving-fresh-spicy-curry-with-go-pro-type-of-perspective-4838-large.mp4",
    description: "Making my signature curry recipe tonight! 🍛 #cooking #food #recipe",
    likes: 302,
    comments: 56,
    shares: 47,
    tags: ["cooking", "food", "recipe"],
    author: {
      id: "user5", // Added ID
      name: "Chef Delicious",
      username: "chefd",
      avatar: "https://randomuser.me/api/portraits/men/40.jpg",
      verified: true,
    },
    isFollowing: true,
    softpoints: 12
  }
];
