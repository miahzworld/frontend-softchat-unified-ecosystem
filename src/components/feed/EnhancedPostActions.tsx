
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Laugh,
  Angry,
  HeartCrack,
  Award,
  Lightbulb,
  Smile,
  Frown,
  Flame
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils";
import { useNotification } from "@/hooks/use-notification";

interface EnhancedPostActionsProps {
  postId: string;
  initialReaction?: string;
  initialLikes: number;
  initialComments: number;
  initialShares: number;
  initialBookmarked?: boolean;
  onComment?: () => void;
}

type Reaction = {
  name: string;
  icon: React.ReactNode;
  color: string;
};

const reactions: Reaction[] = [
  { name: "like", icon: <ThumbsUp className="h-5 w-5" />, color: "text-blue-500" },
  { name: "love", icon: <Heart className="h-5 w-5" />, color: "text-red-500" },
  { name: "haha", icon: <Laugh className="h-5 w-5" />, color: "text-yellow-500" },
  { name: "wow", icon: <Flame className="h-5 w-5" />, color: "text-orange-500" },
  { name: "sad", icon: <Frown className="h-5 w-5" />, color: "text-purple-500" },
  { name: "angry", icon: <Angry className="h-5 w-5" />, color: "text-red-600" },
  { name: "insightful", icon: <Lightbulb className="h-5 w-5" />, color: "text-yellow-400" },
  { name: "support", icon: <Award className="h-5 w-5" />, color: "text-green-500" },
];

const EnhancedPostActions = ({
  postId,
  initialReaction = "",
  initialLikes,
  initialComments,
  initialShares,
  initialBookmarked = false,
  onComment
}: EnhancedPostActionsProps) => {
  const [currentReaction, setCurrentReaction] = useState(initialReaction);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);
  const notification = useNotification();

  const handleReaction = (reaction: string) => {
    // If clicking the same reaction, remove it
    if (reaction === currentReaction) {
      setCurrentReaction("");
      setLikesCount((prev) => Math.max(0, prev - 1));
      notification.info("Reaction removed");
    } else {
      // If changing reaction, don't add to the count
      if (!currentReaction) {
        setLikesCount((prev) => prev + 1);
      }
      setCurrentReaction(reaction);
      notification.success(`Reacted with ${reaction}`);
    }
    setIsReactionPopoverOpen(false);
  };

  const handleComment = () => {
    if (onComment) {
      onComment();
    }
  };

  const handleShare = () => {
    setSharesCount((prev) => prev + 1);
    notification.success("Post shared!");
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    notification.success(bookmarked ? "Post removed from bookmarks" : "Post saved to bookmarks");
  };

  const currentReactionData = reactions.find(r => r.name === currentReaction) || reactions[0];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-1">
        <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1",
                currentReaction && currentReactionData.color
              )}
            >
              {currentReaction ? (
                <>
                  {currentReactionData.icon}
                  <span>{likesCount}</span>
                </>
              ) : (
                <>
                  <Heart className={cn("h-4 w-4", currentReaction && "fill-current")} />
                  <span>{likesCount}</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex gap-1">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.name}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-2 hover:bg-muted rounded-full",
                    reaction.name === currentReaction && reaction.color
                  )}
                  onClick={() => handleReaction(reaction.name)}
                >
                  <span className="sr-only">{reaction.name}</span>
                  {reaction.icon}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground"
        onClick={handleComment}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span>{sharesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-muted-foreground",
          bookmarked && "text-yellow-500"
        )}
        onClick={handleBookmark}
      >
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      </Button>
    </div>
  );
};

export default EnhancedPostActions;
