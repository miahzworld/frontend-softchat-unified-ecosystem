
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { X, CheckCheck, Plus, Sparkles, FastForward, Rewind, Video, Wand2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export type VideoFilter = "none" | "softchat" | "blackwhite" | "vibrant" | "smooth" | "dark";

interface VideoEffect {
  type: "speed";
  value: number;
}

interface VideoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialVideo?: File | null;
}

const VideoEditor = ({ isOpen, onClose, onSuccess, initialVideo }: VideoEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(initialVideo || null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Editor state
  const [activeTab, setActiveTab] = useState("filters");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Content state
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [autoTagsGenerated, setAutoTagsGenerated] = useState<string[]>([]);
  
  // Effect state
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter>("none");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  
  // Initialize video preview if file exists
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);
  
  // Apply playback speed when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive"
      });
      return;
    }
    
    setVideoFile(file);
    
    // Reset editing state when new file is selected
    setSelectedFilter("none");
    setPlaybackSpeed(1);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        setVideoPreviewUrl(url);
        setVideoFile(new File([blob], "recorded-video.webm", { 
          type: 'video/webm'
        }));
        
        // Stop all tracks of the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Prevent feedback
        videoRef.current.play();
      }
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera access failed",
        description: "Please allow camera access to record videos",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    }
  };
  
  const handleGenerateCaption = async () => {
    if (!videoFile || !user) return;
    
    setIsGeneratingCaption(true);
    
    try {
      // Get a 10-second clip from the video for audio transcription
      const audioBlob = await extractAudioFromVideo(videoFile);
      
      if (!audioBlob) {
        throw new Error("Failed to extract audio from video");
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        
        if (!base64data) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // Call the Edge Function for transcription and tag generation
        const { data: aiData, error: aiError } = await supabase.functions.invoke('video-ai-features', {
          body: {
            feature: 'transcript',
            data: {
              audio: base64data
            }
          }
        });
        
        if (aiError) throw aiError;
        
        if (aiData?.transcript) {
          setCaption(aiData.transcript);
          
          // Set suggested tags
          if (aiData.tags && Array.isArray(aiData.tags)) {
            setAutoTagsGenerated(aiData.tags);
          }
          
          toast({
            title: "Caption generated",
            description: "AI has analyzed your video and created a caption"
          });
        }
      };
    } catch (error: any) {
      console.error("Error generating caption:", error);
      toast({
        title: "Caption generation failed",
        description: error.message || "There was an error generating your caption",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };
  
  const extractAudioFromVideo = async (videoFile: File): Promise<Blob | null> => {
    // This is a simplified approach - in a production app, you might want to
    // use a more sophisticated audio extraction technique or Web Audio API
    return videoFile;
  };
  
  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/\s+/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput("");
    }
  };
  
  const handleAddAutoTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      // Remove from suggestions
      setAutoTagsGenerated(autoTagsGenerated.filter(t => t !== tag));
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const applyFilter = (filter: VideoFilter) => {
    setSelectedFilter(filter);
    
    if (videoRef.current) {
      // Remove any existing filter classes
      videoRef.current.className = "w-full h-full object-contain";
      
      // Add the new filter class
      switch (filter) {
        case "softchat":
          videoRef.current.classList.add("softchat-filter");
          break;
        case "blackwhite":
          videoRef.current.classList.add("blackwhite-filter");
          break;
        case "vibrant":
          videoRef.current.classList.add("vibrant-filter");
          break;
        case "smooth":
          videoRef.current.classList.add("smooth-filter");
          break;
        case "dark":
          videoRef.current.classList.add("dark-filter");
          break;
      }
    }
  };
  
  const handleSpeedChange = (value: number[]) => {
    const speed = value[0];
    setPlaybackSpeed(speed);
    
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };
  
  const handleUpload = async () => {
    if (!videoFile || !user) return;
    
    setIsProcessing(true);
    
    try {
      const fileExt = videoFile.name.split('.').pop() || 'mp4';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload video to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile);
      
      if (storageError) throw storageError;
      
      // Get URL for the uploaded video
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      // Create post with video
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption,
          video_url: urlData.publicUrl,
          type: 'video',
          tags: tags,
          filter: selectedFilter !== "none" ? selectedFilter : null,
          softpoints: Math.floor(Math.random() * 50) + 5, // Random softpoints for demo
        });
      
      if (postError) throw postError;
      
      toast({
        title: "Video uploaded successfully",
        description: "Your creative masterpiece has been shared!"
      });
      
      // Reset form and close editor
      handleReset();
      onClose();
      
      // Refresh videos list if callback provided
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your video",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setCaption("");
    setTags([]);
    setTagInput("");
    setAutoTagsGenerated([]);
    setSelectedFilter("none");
    setPlaybackSpeed(1);
    setActiveTab("filters");
  };
  
  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto p-0">
        <div className="flex flex-col h-full">
          {/* Video preview area */}
          <div className="relative bg-black aspect-[9/16] w-full flex items-center justify-center">
            {isRecording ? (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-contain" 
                  autoPlay 
                  muted
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    size="sm"
                  >
                    Stop Recording
                  </Button>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="animate-pulse flex">
                    <div className="h-3 w-3 bg-red-600 rounded-full mr-2"></div>
                    <span className="text-white text-xs">RECORDING</span>
                  </div>
                </div>
              </div>
            ) : videoPreviewUrl ? (
              <video 
                ref={videoRef} 
                src={videoPreviewUrl} 
                className="w-full h-full object-contain"
                controls
                loop
              />
            ) : (
              <div className="text-center p-8">
                <Video className="h-16 w-16 mb-4 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Video Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Upload a video or record directly using your camera
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("video-file-input")?.click()}
                  >
                    Upload Video
                  </Button>
                  <Button onClick={startRecording}>
                    Record Video
                  </Button>
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
          
          {videoFile && !isRecording && (
            <div className="p-4 flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-4">
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                  <TabsTrigger value="caption">Caption & Tags</TabsTrigger>
                </TabsList>
                
                <TabsContent value="filters" className="mt-0">
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => applyFilter("none")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "none" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-gray-100 flex items-center justify-center rounded">
                        <span className="text-xs">Original</span>
                      </div>
                      <span className="text-xs">None</span>
                    </button>
                    <button 
                      onClick={() => applyFilter("softchat")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "softchat" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-blue-100 flex items-center justify-center rounded">
                        <span className="text-xs text-blue-800">Blue</span>
                      </div>
                      <span className="text-xs">Softchat</span>
                    </button>
                    <button 
                      onClick={() => applyFilter("blackwhite")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "blackwhite" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-gray-400 flex items-center justify-center rounded">
                        <span className="text-xs text-white">B&W</span>
                      </div>
                      <span className="text-xs">Black & White</span>
                    </button>
                    <button 
                      onClick={() => applyFilter("vibrant")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "vibrant" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center rounded">
                        <span className="text-xs text-white">Vibrant</span>
                      </div>
                      <span className="text-xs">Vibrant</span>
                    </button>
                    <button 
                      onClick={() => applyFilter("smooth")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "smooth" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-orange-100 flex items-center justify-center rounded">
                        <span className="text-xs text-orange-800">Smooth</span>
                      </div>
                      <span className="text-xs">Smooth Skin</span>
                    </button>
                    <button 
                      onClick={() => applyFilter("dark")}
                      className={`p-2 rounded-md text-center ${selectedFilter === "dark" ? "ring-2 ring-primary" : "border"}`}
                    >
                      <div className="aspect-square mb-1 bg-gray-800 flex items-center justify-center rounded">
                        <span className="text-xs text-gray-300">Dark</span>
                      </div>
                      <span className="text-xs">Dark Mode</span>
                    </button>
                  </div>
                </TabsContent>
                
                <TabsContent value="effects" className="mt-0 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Playback Speed: {playbackSpeed}x
                      </label>
                      <div className="flex items-center gap-2">
                        <Rewind className="h-4 w-4 text-muted-foreground" />
                        <FastForward className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Slider
                      defaultValue={[1]}
                      min={0.5}
                      max={2}
                      step={0.5}
                      onValueChange={handleSpeedChange}
                      value={[playbackSpeed]}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>1.5x</span>
                      <span>2x</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Stickers & Effects</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Placeholder for stickers - in a real app, these would be functional */}
                      {["⭐", "🔥", "😎", "🎉", "💯", "🎵", "🌈", "✨"].map((sticker, i) => (
                        <Button 
                          key={i} 
                          variant="outline"
                          className="aspect-square text-xl"
                          disabled
                        >
                          {sticker}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Stickers coming soon!
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="caption" className="mt-0 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="caption" className="text-sm font-medium">
                        Caption
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={handleGenerateCaption}
                        disabled={isGeneratingCaption}
                      >
                        {isGeneratingCaption ? (
                          <>Generating...</>
                        ) : (
                          <>
                            <Wand2 className="h-3.5 w-3.5 mr-1" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="caption"
                      placeholder="What's happening in this video?"
                      className="min-h-[80px]"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                          #{tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0 rounded-full hover:bg-muted"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center">
                        <Input
                          placeholder="Add tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="max-w-[150px] h-8 text-sm"
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {autoTagsGenerated.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Suggested tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {autoTagsGenerated.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => handleAddAutoTag(tag)}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? "Posting..." : (
                    <>
                      <CheckCheck className="h-4 w-4" /> Post Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoEditor;
