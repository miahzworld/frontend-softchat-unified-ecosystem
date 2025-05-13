
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullscreenToggleProps {
  targetRef: React.RefObject<HTMLElement>;
}

const FullscreenToggle = ({ targetRef }: FullscreenToggleProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    if (!targetRef.current) return;

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await targetRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [targetRef]);

  // Update state when fullscreen changes outside of our control
  // (like pressing Escape key)
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  // Set up event listener
  useState(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
      onClick={toggleFullscreen}
    >
      {isFullscreen ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <Maximize2 className="h-5 w-5" />
      )}
    </Button>
  );
};

export default FullscreenToggle;
