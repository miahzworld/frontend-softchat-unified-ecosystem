
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/hooks/use-notification";
import { useState } from "react";

export interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  category: string;
  isMember?: boolean;
  isPrivate?: boolean;
}

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
}

const GroupCard = ({ group, onJoin, onLeave }: GroupCardProps) => {
  const [isMember, setIsMember] = useState(group.isMember || false);
  const [memberCount, setMemberCount] = useState(group.memberCount);
  const notification = useNotification();

  const handleJoinLeave = () => {
    if (isMember) {
      // Leave group
      setIsMember(false);
      setMemberCount(prev => prev - 1);
      notification.success(`Left ${group.name}`);
      if (onLeave) onLeave(group.id);
    } else {
      // Join group
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      notification.success(`Joined ${group.name}`);
      if (onJoin) onJoin(group.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 w-full bg-gradient-to-r from-blue-400 to-indigo-600 relative">
        {group.image && (
          <img 
            src={group.image} 
            alt={group.name} 
            className="h-full w-full object-cover absolute inset-0"
          />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-4 border-background -mt-8">
              <AvatarImage src={group.image || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{memberCount} members</span>
                {group.isPrivate && (
                  <Badge variant="outline" className="text-xs">Private</Badge>
                )}
                <Badge variant="secondary" className="text-xs">{group.category}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
        
        <div className="flex justify-end">
          <Button 
            variant={isMember ? "outline" : "default"}
            size="sm"
            onClick={handleJoinLeave}
          >
            {isMember ? "Leave" : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
