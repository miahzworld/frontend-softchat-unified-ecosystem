
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FooterNav from "@/components/layout/FooterNav";
import VideoCard from "@/components/videos/VideoCard";
import VideoUpload from "@/components/videos/VideoUpload";
import AdCard from "@/components/videos/AdCard";
import { useVideos } from "@/hooks/use-videos";
import { VideoItem, AdItem } from "@/types/video";
import { ArrowUpIcon, ArrowDownIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/hooks/use-notification";

const Videos = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const {
    currentItem,
    swipeHandlers,
    handleNextVideo,
    handlePrevVideo,
    currentIndex,
    isLoading,
    allItems,
    refreshVideos
  } = useVideos();

  const handleOpenUploadModal = () => {
    if (!user) {
      notification.info("Please sign in to upload videos");
      return;
    }
    setShowUploadModal(true);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(92vh-4rem)] pb-16 md:pb-0 bg-black flex items-center 
      overflow-hidden justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
          <p>Loading videos...</p>
        </div>
        <FooterNav />
      </div>
    );
  }

  if (!currentItem || allItems.length === 0) {
    return (
      <div className="h-[calc(92vh-4rem)] pb-16 md:pb-0 bg-black flex items-center 
      overflow-hidden justify-center text-white">
        <div className="flex flex-col items-center text-center px-4">
          <p className="mb-4">No videos available</p>
          <Button onClick={handleOpenUploadModal}>
            Upload your first video
          </Button>
        </div>
        <FooterNav />
      </div>
    );
  }

  return (
    <div
      className="h-[calc(92vh-4rem)] pb-16 md:pb-0 bg-black overflow-hidden relative"
      {...swipeHandlers}
    >
      {/* Video Player */}
      {'isAd' in currentItem ? (
        <AdCard
          ad={(currentItem as AdItem).ad}
          onNext={handleNextVideo}
          onPrev={handlePrevVideo}
        />
      ) : (
        <VideoCard
          video={currentItem as VideoItem}
          onNext={handleNextVideo}
          onPrev={handlePrevVideo}
          isActive={true}
        />
      )}

      {/* Navigation indicators */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex justify-center pt-6">
          <div className="flex flex-col items-center gap-1 text-gray-400 text-sm">
            <ArrowUpIcon className="animate-bounce" />
            <span>Swipe for videos</span>
          </div>
        </div>
      </div>

      {/* Upload button */}
      <Button
        className="absolute bottom-24 md:bottom-8 right-4 h-14 w-14 rounded-full shadow-lg"
        onClick={handleOpenUploadModal}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Navigation dots */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {allItems.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUpload 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        onSuccess={refreshVideos}
      />

      <FooterNav />
    </div>
  );
};

export default Videos;
