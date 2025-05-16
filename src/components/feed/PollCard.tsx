
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, BarChart2, Clock } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt?: string;
  createdAt: string;
}

interface PollCardProps {
  poll: PollPost;
}

const PollCard: React.FC<PollCardProps> = ({ poll }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollData, setPollData] = useState<PollPost>(poll);
  const notification = useNotification();

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted) return;
    setSelectedOptionId(optionId);
  };

  const handleVote = () => {
    if (!selectedOptionId || hasVoted) return;

    // In a real app, we'd send this to an API
    const newPollData = {
      ...pollData,
      totalVotes: pollData.totalVotes + 1,
      options: pollData.options.map((option) =>
        option.id === selectedOptionId
          ? { ...option, votes: option.votes + 1 }
          : option
      ),
    };

    setPollData(newPollData);
    setHasVoted(true);
    notification.success("Vote recorded!");
  };

  const formatRemainingTime = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row gap-3 items-start">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={poll.author.avatar || "/placeholder.svg"} alt={poll.author.name} />
          <AvatarFallback>{poll.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center">
            <span className="font-semibold truncate">{poll.author.name}</span>
            {poll.author.verified && (
              <Badge variant="default" className="ml-1 px-1 py-0 h-5 bg-softchat-primary hover:bg-softchat-primary/90 flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="truncate">@{poll.author.username}</span>
            <span className="mx-1 flex-shrink-0">·</span>
            <span className="flex-shrink-0">{poll.createdAt}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-4">{poll.question}</h3>
          
          <div className="space-y-3">
            {pollData.options.map((option) => {
              const percentage = pollData.totalVotes > 0 
                ? Math.round((option.votes / pollData.totalVotes) * 100) 
                : 0;
                
              return (
                <div 
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
                    selectedOptionId === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  } ${hasVoted ? 'cursor-default' : ''}`}
                >
                  {hasVoted && (
                    <Progress 
                      value={percentage} 
                      className="absolute inset-0 h-full rounded-lg opacity-20 z-0" 
                    />
                  )}
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      {selectedOptionId === option.id && !hasVoted && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span>{option.text}</span>
                    </div>
                    
                    {hasVoted && (
                      <div className="font-medium">
                        {percentage}%
                      </div>
                    )}
                  </div>
                  
                  {hasVoted && (
                    <div className="text-sm text-muted-foreground mt-1 relative z-10">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span>{pollData.totalVotes} votes</span>
          </div>
          
          {poll.endsAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatRemainingTime(poll.endsAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {!hasVoted && (
        <CardFooter className="px-4 py-3 border-t flex justify-end">
          <Button 
            onClick={handleVote} 
            disabled={!selectedOptionId}
          >
            Vote
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PollCard;
