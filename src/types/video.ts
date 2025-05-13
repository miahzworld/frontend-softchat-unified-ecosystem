
export type VideoItem = {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  tags?: string[];
  softpoints?: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  isFollowing: boolean;
};

export type AdData = {
  id: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  url: string;
  sponsor: string;
};

export type AdItem = {
  isAd: true;
  ad: AdData;
};

export type ContentItem = VideoItem | AdItem;
