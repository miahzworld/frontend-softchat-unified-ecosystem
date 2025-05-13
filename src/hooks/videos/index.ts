
import { useState, useCallback } from "react";
import { ContentItem } from "@/types/video";
import { useVideoNavigation } from "./use-video-navigation";
import { useVideoData } from "./use-video-data";
import { useAuth } from "@/contexts/AuthContext";

export const useVideos = () => {
  const { user } = useAuth();
  const { allItems, isLoading, refreshVideos } = useVideoData();
  const { currentIndex, handleNextVideo, handlePrevVideo, swipeHandlers } = 
    useVideoNavigation(allItems.length);

  const getCurrentItem = useCallback((): ContentItem | null => {
    if (isLoading || allItems.length === 0) return null;
    return allItems[currentIndex % allItems.length];
  }, [isLoading, allItems, currentIndex]);

  return {
    currentItem: getCurrentItem(),
    handleNextVideo,
    handlePrevVideo,
    allItems,
    swipeHandlers,
    currentIndex,
    isLoading,
    refreshVideos
  };
};
