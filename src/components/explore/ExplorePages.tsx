
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/utils/formatters";
import { 
  Plus, 
  Users, 
  Settings, 
  Crown, 
  UserPlus, 
  MessageSquare, 
  Calendar,
  MapPin,
  Globe,
  Building,
  Verified,
  BarChart3,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  Heart,
  Share2,
  Star,
  Store,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description?: string;
  pageType: 'business' | 'brand' | 'public_figure' | 'community' | 'organization';
  isFollowing?: boolean;
  isOwner?: boolean;
  website?: string;
  location?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  posts?: number;
  engagement?: number;
}

interface ExplorePagesProps {
  pages: Page[];
}

const ExplorePages = ({ pages }: ExplorePagesProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [myPages, setMyPages] = useState<Page[]>([]);
  const [pageForm, setPageForm] = useState({
    name: '',
    description: '',
    category: '',
    pageType: 'business',
    website: '',
    location: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const { toast } = useToast();

  // Mock user pages data
  const mockFollowedPages: Page[] = [
    {
      id: 'followed-1',
      name: 'TechCorp Inc.',
      followers: 25420,
      category: 'Technology',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      pageType: 'business',
      isFollowing: true,
      description: 'Leading technology solutions provider'
    },
    {
      id: 'followed-2',
      name: 'Digital Marketing Hub',
      followers: 18340,
      category: 'Marketing',
      verified: false,
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100',
      pageType: 'brand',
      isFollowing: true,
      description: 'Your go-to source for digital marketing tips'
    }
  ];

  const mockMyPages: Page[] = [
    {
      id: 'my-1',
      name: 'Startup Studio',
      followers: 3450,
      category: 'Business',
      verified: false,
      avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100',
      pageType: 'business',
      isOwner: true,
      description: 'Helping startups grow and scale',
      posts: 45,
      engagement: 87
    }
  ];

  const handleCreatePage = () => {
    if (!pageForm.name || !pageForm.category || !pageForm.pageType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: pageForm.name,
      description: pageForm.description,
      category: pageForm.category,
      pageType: pageForm.pageType as any,
      website: pageForm.website,
      location: pageForm.location,
      email: pageForm.email,
      phone: pageForm.phone,
      avatar: pageForm.avatar || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      followers: 0,
      verified: false,
      isOwner: true,
      posts: 0,
      engagement: 0
    };

    setMyPages(prev => [...prev, newPage]);
    setPageForm({
      name: '',
      description: '',
      category: '',
      pageType: 'business',
      website: '',
      location: '',
      email: '',
      phone: '',
      avatar: ''
    });
    setShowCreateDialog(false);

    toast({
      title: "Page Created",
      description: `${newPage.name} has been created successfully!`
    });
  };

  const handleFollowPage = (page: Page) => {
    if (page.isFollowing) return;

    const updatedPage = { ...page, isFollowing: true };
    setFollowedPages(prev => [...prev, updatedPage]);

    toast({
      title: "Following Page",
      description: `You're now following ${page.name}!`
    });
  };

  const handleUnfollowPage = (pageId: string) => {
    setFollowedPages(prev => prev.filter(p => p.id !== pageId));
    toast({
      title: "Unfollowed Page",
      description: "You've unfollowed the page successfully"
    });
  };

  const categories = [
    'Technology', 'Business', 'Marketing', 'Finance', 'Healthcare', 
    'Education', 'Entertainment', 'Sports', 'Food & Beverage', 'Fashion'
  ];

  const pageTypes = [
    { value: 'business', label: 'Business', icon: Building },
    { value: 'brand', label: 'Brand', icon: Star },
    { value: 'public_figure', label: 'Public Figure', icon: Users },
    { value: 'community', label: 'Community', icon: Heart },
    { value: 'organization', label: 'Organization', icon: Briefcase }
  ];

  const getPageTypeIcon = (type: string) => {
    const pageType = pageTypes.find(pt => pt.value === type);
    return pageType ? pageType.icon : Building;
  };

  const renderPageCard = (page: Page, showManageButton = false) => {
    const PageTypeIcon = getPageTypeIcon(page.pageType);
    
    return (
      <Card key={page.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={page.avatar} alt={page.name} />
                <AvatarFallback>{page.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {page.verified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                  <Verified className="h-3 w-3" fill="currentColor" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base truncate">{page.name}</h3>
                    {page.verified && (
                      <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
                        <Verified className="h-3 w-3" fill="currentColor" />
                      </Badge>
                    )}
                    {page.isOwner && (
                      <Badge variant="outline" className="bg-yellow-600 text-white border-yellow-600">
                        <Crown className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <PageTypeIcon className="w-3 h-3" />
                    <span>{page.category}</span>
                    {page.location && (
                      <>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{page.location}</span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">{formatNumber(page.followers)} followers</p>
                  
                  {page.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {!page.isFollowing && !page.isOwner ? (
                  <Button 
                    onClick={() => handleFollowPage(page)}
                    size="sm" 
                    className="text-xs"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Follow
                  </Button>
                ) : page.isFollowing ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUnfollowPage(page.id)}
                      className="text-xs"
                    >
                      Following
                    </Button>
                  </div>
                ) : null}
                
                {showManageButton && page.isOwner && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedPage(page);
                      setShowManageDialog(true);
                    }}
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Pages</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageName">Page Name *</Label>
                <Input
                  id="pageName"
                  value={pageForm.name}
                  onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter page name"
                />
              </div>
              
              <div>
                <Label htmlFor="pageType">Page Type *</Label>
                <Select 
                  value={pageForm.pageType} 
                  onValueChange={(value) => setPageForm(prev => ({ ...prev, pageType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page type" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pageCategory">Category *</Label>
                <Select 
                  value={pageForm.category} 
                  onValueChange={(value) => setPageForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pageDescription">Description</Label>
                <Textarea
                  id="pageDescription"
                  value={pageForm.description}
                  onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your page"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="pageWebsite">Website</Label>
                <Input
                  id="pageWebsite"
                  value={pageForm.website}
                  onChange={(e) => setPageForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="pageLocation">Location</Label>
                <Input
                  id="pageLocation"
                  value={pageForm.location}
                  onChange={(e) => setPageForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <Label htmlFor="pageEmail">Contact Email</Label>
                <Input
                  id="pageEmail"
                  type="email"
                  value={pageForm.email}
                  onChange={(e) => setPageForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreatePage} className="flex-1">
                  Create Page
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Page Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="owned">My Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="space-y-3">
            {pages.length > 0 ? (
              pages.map((page) => renderPageCard(page))
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No pages found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          <div className="space-y-3">
            {[...followedPages, ...mockFollowedPages].length > 0 ? (
              [...followedPages, ...mockFollowedPages].map((page) => renderPageCard(page, false))
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">You're not following any pages yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setActiveTab("discover")}
                >
                  Discover Pages
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="owned" className="space-y-4">
          <div className="space-y-3">
            {[...myPages, ...mockMyPages].length > 0 ? (
              [...myPages, ...mockMyPages].map((page) => renderPageCard(page, true))
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">You haven't created any pages yet</p>
                <Button 
                  size="sm" 
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Your First Page
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Page Management Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage {selectedPage?.name}</DialogTitle>
          </DialogHeader>
          {selectedPage && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Page Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{formatNumber(selectedPage.followers)}</div>
                      <p className="text-sm text-muted-foreground">Total Followers</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{selectedPage.posts || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{selectedPage.engagement || 0}%</div>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">2.4K</div>
                      <p className="text-sm text-muted-foreground">Monthly Reach</p>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Page Name</Label>
                    <Input defaultValue={selectedPage.name} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea defaultValue={selectedPage.description} rows={3} />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input defaultValue={selectedPage.website} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input defaultValue={selectedPage.location} />
                  </div>
                  <div className="flex gap-2">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="posts" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Recent Posts</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Post
                  </Button>
                </div>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExplorePages;
