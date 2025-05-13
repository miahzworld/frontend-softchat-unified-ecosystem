
import { useState, useCallback } from "react";

export const useVideoNavigation = (videosCount: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleNextVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < videosCount - 1 ? prev + 1 : 0
    );
  }, [videosCount]);

  const handlePrevVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : videosCount - 1
    );
  }, [videosCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      handleNextVideo();
    } else if (touchEnd - touchStart > 50) {
      // Swipe down
      handlePrevVideo();
    }
  }, [touchStart, touchEnd, handleNextVideo, handlePrevVideo]);

  return {
    currentIndex,
    handleNextVideo,
    handlePrevVideo,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
