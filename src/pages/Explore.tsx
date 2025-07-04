import { useState } from "react";
import SearchBar from "@/components/explore/SearchBar";
import ExploreContent from "@/components/explore/ExploreContent";
import SuggestedUsers from "@/components/profile/SuggestedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExplore } from "@/hooks/use-explore";
import { SmartContentRecommendations } from "@/components/ai/SmartContentRecommendations";
import { Users, TrendingUp, Hash, Globe, Sparkles } from "lucide-react";

const Explore = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredTopics,
    filteredUsers,
    filteredHashtags,
    filteredGroups,
    filteredPages,
  } = useExplore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Tabs defaultValue="discover" className="w-full">
          {/* Mobile-friendly tabs */}
          <div className="sm:hidden">
            <TabsList className="flex w-full overflow-x-auto gap-1 p-1 h-auto min-h-[60px] mobile-tabs-scroll">
              <TabsTrigger
                value="discover"
                className="flex flex-col items-center gap-1 text-xs min-w-[65px] h-auto py-2 px-2 mobile-tab-item touch-target"
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] leading-tight">Discover</span>
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="flex flex-col items-center gap-1 text-xs min-w-[65px] h-auto py-2 px-2 mobile-tab-item touch-target"
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] leading-tight">Trending</span>
              </TabsTrigger>
              <TabsTrigger
                value="hashtags"
                className="flex flex-col items-center gap-1 text-xs min-w-[65px] h-auto py-2 px-2 mobile-tab-item touch-target"
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] leading-tight">Tags</span>
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="flex flex-col items-center gap-1 text-xs min-w-[65px] h-auto py-2 px-2 mobile-tab-item touch-target"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] leading-tight">Explore</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Discover</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>Hashtags</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Explore</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="discover" className="space-y-6 mt-6">
            {/* AI Powered Recommendations */}
            <SmartContentRecommendations
              contentType="mixed"
              availableContent={[
                ...filteredTopics.map((topic, index) => ({
                  ...topic,
                  id: topic.id || `topic-${index}`,
                })),
                ...filteredUsers.map((user, index) => ({
                  ...user,
                  id: user.id || `user-${index}`,
                })),
                ...filteredHashtags.map((hashtag, index) => ({
                  ...hashtag,
                  id: hashtag.id || `hashtag-${index}`,
                })),
              ]}
              onContentSelect={(content) => {
                console.log("Selected content from explore:", content);
              }}
              maxItems={6}
              className="mb-6"
              layout="grid"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SuggestedUsers
                  title="Featured Users"
                  variant="grid"
                  maxUsers={6}
                />
              </div>
              <div className="space-y-4">
                <SuggestedUsers title="New Users" variant="card" maxUsers={4} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trending Sellers</CardTitle>
                </CardHeader>
                <CardContent>
                  <SuggestedUsers
                    variant="list"
                    maxUsers={3}
                    showTitle={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Freelancers</CardTitle>
                </CardHeader>
                <CardContent>
                  <SuggestedUsers
                    variant="list"
                    maxUsers={3}
                    showTitle={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Traders</CardTitle>
                </CardHeader>
                <CardContent>
                  <SuggestedUsers
                    variant="list"
                    maxUsers={3}
                    showTitle={false}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hashtags" className="mt-6">
            <ExploreContent
              activeTab="hashtags"
              setActiveTab={setActiveTab}
              filteredTopics={filteredTopics}
              filteredUsers={filteredUsers}
              filteredHashtags={filteredHashtags}
              filteredGroups={filteredGroups}
              filteredPages={filteredPages}
            />
          </TabsContent>

          <TabsContent value="explore" className="mt-6">
            <ExploreContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredTopics={filteredTopics}
              filteredUsers={filteredUsers}
              filteredHashtags={filteredHashtags}
              filteredGroups={filteredGroups}
              filteredPages={filteredPages}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
