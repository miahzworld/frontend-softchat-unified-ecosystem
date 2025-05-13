
import { VideoItem, AdData } from "@/types/video";

export const mockVideos: VideoItem[] = [
  {
    id: "1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1620118373803-9cb777efcfba?q=80&w=800&auto=format&fit=crop",
    description: "Amazing ocean views 🌊 #nature #ocean #waves",
    likes: 12543,
    comments: 432,
    shares: 129,
    tags: ["nature", "ocean", "waves"],
    softpoints: 15,
    author: {
      id: "user1", // Added id property
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      verified: true,
    },
    isFollowing: true,
  },
  {
    id: "2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1596993100471-c3905dae0b84?q=80&w=800&auto=format&fit=crop",
    description: "Spring has arrived! 🌸 #spring #flowers #nature",
    likes: 8432,
    comments: 256,
    shares: 78,
    tags: ["spring", "flowers", "nature"],
    softpoints: 8,
    author: {
      id: "user2", // Added id property
      name: "Michael Chen",
      username: "mikechen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: false,
    },
    isFollowing: false,
  },
  {
    id: "3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-woman-running-through-the-city-32952-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=800&auto=format&fit=crop",
    description: "Morning run through the city 🏙️ #fitness #running #citylife",
    likes: 5672,
    comments: 187,
    shares: 42,
    tags: ["fitness", "running", "citylife"],
    softpoints: 12,
    author: {
      id: "user3", // Added id property
      name: "Jessica Williams",
      username: "jesswill",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      verified: true,
    },
    isFollowing: true,
  },
];

export const mockAdData: AdData = {
  id: "ad1",
  title: "Try our new fitness app!",
  description: "Get in shape with personalized workouts and nutrition plans.",
  cta: "Download Now",
  image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
  url: "#",
  sponsor: "FitLife Pro",
};
