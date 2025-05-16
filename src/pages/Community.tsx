
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import GroupCard, { Group } from "@/components/community/GroupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Plus, Compass, Heart } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";

// Mock groups data
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Tech Enthusiasts",
    description: "A community for discussing the latest in technology, gadgets, and innovation.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 3254,
    category: "Technology",
    isMember: false,
  },
  {
    id: "2",
    name: "Crypto Traders",
    description: "Join us to discuss cryptocurrency trends, trading strategies, and market analysis.",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 2187,
    category: "Finance",
    isMember: true,
  },
  {
    id: "3",
    name: "Photography Club",
    description: "Share your photography, get feedback, and learn new techniques from fellow photographers.",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 1821,
    category: "Art",
    isMember: false,
  },
  {
    id: "4",
    name: "Fitness Motivation",
    description: "Stay motivated, share your fitness journey, and get tips from others in the community.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 4325,
    category: "Health",
    isMember: false,
  },
  {
    id: "5",
    name: "Book Club",
    description: "Discuss books, share recommendations, and participate in our monthly reading challenges.",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 1245,
    category: "Education",
    isMember: false,
    isPrivate: true,
  },
  {
    id: "6",
    name: "Travel Adventures",
    description: "Share your travel experiences, photos, and get recommendations for your next trip.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 5478,
    category: "Travel",
    isMember: false,
  },
  {
    id: "7",
    name: "Pet Lovers",
    description: "A place for pet owners to share stories, advice, and cute pictures of their furry friends.",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 7823,
    category: "Lifestyle",
    isMember: false,
  },
  {
    id: "8",
    name: "Foodies",
    description: "Share recipes, restaurant recommendations, and food photography with fellow food enthusiasts.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=300&auto=format&fit=crop",
    memberCount: 3621,
    category: "Food",
    isMember: false,
  },
];

const categories = [
  "All Categories",
  "Technology",
  "Finance",
  "Art",
  "Health",
  "Education",
  "Travel",
  "Lifestyle",
  "Food",
];

const Community = () => {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoading, setIsLoading] = useState(false);
  const notification = useNotification();

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myGroups = groups.filter(group => group.isMember);

  const handleJoinGroup = (groupId: string) => {
    // In a real app, this would be an API call
    setGroups(groups.map(group => 
      group.id === groupId ? {...group, isMember: true, memberCount: group.memberCount + 1} : group
    ));
    notification.success("Joined group successfully");
  };

  const handleLeaveGroup = (groupId: string) => {
    // In a real app, this would be an API call
    setGroups(groups.map(group => 
      group.id === groupId ? {...group, isMember: false, memberCount: Math.max(0, group.memberCount - 1)} : group
    ));
    notification.success("Left group successfully");
  };

  const handleCreateGroup = () => {
    notification.info("Group creation coming soon!");
  };

  return (
    <>
      <Helmet>
        <title>Communities | Softchat</title>
      </Helmet>

      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Communities</h1>
          <Button onClick={handleCreateGroup}>
            <Plus className="h-4 w-4 mr-2" /> Create Group
          </Button>
        </div>

        <Tabs defaultValue="discover" className="mb-6">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="discover" className="flex items-center gap-1">
              <Compass className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger value="my-groups" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>My Groups</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                />
              ))}
              
              {filteredGroups.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-10 text-center border rounded-lg bg-muted/30">
                  <Compass className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-xl font-semibold mb-1">No groups found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any groups matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-groups">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.length > 0 ? (
                myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onLeave={handleLeaveGroup}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-10 text-center border rounded-lg bg-muted/30">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-xl font-semibold mb-1">No groups joined yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't joined any communities yet. Discover and join groups that interest you.
                  </p>
                  <Button>Explore Groups</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg bg-muted/30">
              <Heart className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-xl font-semibold mb-1">Favorites coming soon</h3>
              <p className="text-muted-foreground">
                We're working on adding the ability to favorite groups for quick access.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Community;
