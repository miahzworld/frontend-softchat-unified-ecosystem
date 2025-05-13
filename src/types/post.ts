
// src/types/post.ts
export interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
}

export type PostType = 'text' | 'video' | 'image';

export type CreatePost = {
    id: string;
    author: {
        name: string;
        username: string;
        avatar: string;
        verified: boolean;
    };
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
};
