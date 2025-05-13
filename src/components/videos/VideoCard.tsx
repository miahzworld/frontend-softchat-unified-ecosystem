
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, User, Plus } from "lucide-react";
import { cn } from "@/utils/utils";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/use-notification";
import { supabase } from "@/lib/supabase/client";
import { VideoItem } from "@/types/video";

interface VideoCardProps {
  video: VideoItem;
  onNext: () => void;
  onPrev: () => void;
  isActive: boolean;
}

const VideoCard = ({ video, onNext, onPrev, isActive }: VideoCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.7,
  });
  
  const { user } = useAuth();
  const notification = useNotification();

  // Play/pause video based on visibility and active state
  useEffect(() => {
    if (videoRef.current) {
      if (inView && isActive) {
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [inView, isActive]);

  // Handle like button click
  const handleLike = async () => {
    if (!user) {
      notification.info("Please sign in to like videos");
      return;
    }

    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newLikedState);
    setLikesCount(newLikesCount);

    try {
      if (newLikedState) {
        // Add like
        await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: video.id
          });
        notification.success("Video liked!");
      } else {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', video.id);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert UI state on error
      setIsLiked(!newLikedState);
      setLikesCount(likesCount);
      notification.error("Failed to update like");
    }
  };

  // Handle follow button click
  const handleFollow = async () => {
    if (!user) {
      notification.info("Please sign in to follow users");
      return;
    }

    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);

    try {
      if (newFollowState) {
        // Follow user
        await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: video.author.id
          });
        notification.success(`Now following ${video.author.username}`);
      } else {
        // Unfollow user
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', video.author.id);
        notification.info(`Unfollowed ${video.author.username}`);
      }
    } catch (error) {
      console.error("Error updating follow state:", error);
      // Revert UI state on error
      setIsFollowing(!newFollowState);
      notification.error("Failed to update follow status");
    }
  };

  // Handle comment button click
  const handleComment = () => {
    notification.info("Comments coming soon");
  };

  // Handle share button click
  const handleShare = () => {
    notification.info("Sharing options coming soon");
  };

  // Format the video tags
  const formattedTags = video.tags?.map(tag => 
    tag.startsWith('#') ? tag : `#${tag}`
  ).join(' ') || '';

  return (
    <div 
      ref={ref}
      className="relative h-full w-full flex flex-col items-center justify-center bg-black"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="h-full w-full object-contain"
        playsInline
        loop
        muted={false}
        controls={false}
        onClick={() => {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
        }}
      />
      
      {/* Overlay content */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bottom overlay with gradient and info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end justify-between">
            {/* User info and caption */}
            <div className="flex-1 text-white pointer-events-auto">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-10 w-10 border border-white">
                  <AvatarImage src={video.author.avatar} alt={video.author.name} />
                  <AvatarFallback>{video.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{video.author.username}</p>
                    {video.author.verified && (
                      <Badge className="h-4 px-1 bg-blue-500">✓</Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80">{video.author.name}</p>
                </div>
                <Button 
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm" 
                  className="ml-2 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow();
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
              
              {/* Caption and tags */}
              <p className="mb-1">{video.description}</p>
              {formattedTags && (
                <p className="text-sm text-blue-400">{formattedTags}</p>
              )}

              {/* SoftPoints */}
              {video.softpoints > 0 && (
                <div className="mt-2 inline-flex items-center bg-green-500/20 px-2 py-1 rounded-full">
                  <span className="text-xs text-green-500 font-semibold">
                    +{video.softpoints} SoftPoints
                  </span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-4 items-center pointer-events-auto">
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                >
                  <Heart 
                    className={cn("h-6 w-6", isLiked && "fill-red-500 text-red-500")} 
                  />
                </Button>
                <span className="text-white text-xs mt-1">{likesCount}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComment();
                  }}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <span className="text-white text-xs mt-1">{video.comments}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
                <span className="text-white text-xs mt-1">{video.shares}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
