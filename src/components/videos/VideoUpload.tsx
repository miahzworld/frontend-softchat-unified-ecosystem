
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Video, 
  Upload, 
  Camera, 
  X, 
  Play,
  Pencil
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import VideoEditor from "./VideoEditor";

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VideoUpload = ({ isOpen, onClose, onSuccess }: VideoUploadProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Open editor immediately with the selected video
    setShowEditor(true);
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
        setVideoPreview(url);
        setVideoFile(new File([blob], "recorded-video.webm", { 
          type: 'video/webm'
        }));
        
        // Stop all tracks of the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Open editor immediately with the recorded video
        setShowEditor(true);
      };

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
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
      
      if (videoPreviewRef.current) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoPreviewRef.current.srcObject = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !user) return;

    setIsUploading(true);
    const fileExt = videoFile.name.split('.').pop() || 'mp4';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      // Upload video to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile);

      if (storageError) throw storageError;

      // Get the URL for the uploaded video
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Create a post with the video
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption,
          video_url: urlData.publicUrl,
          type: 'video',
          tags: tagArray,
          softpoints: Math.floor(Math.random() * 50) + 5, // Random softpoints for demo
        });

      if (postError) throw postError;

      toast({
        title: "Video uploaded successfully",
        description: "Your video has been posted"
      });

      // Reset form
      setVideoFile(null);
      setCaption("");
      setTags("");
      setVideoPreview(null);
      
      // Close dialog
      onClose();
      
      // Refresh videos list
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your video",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    setVideoFile(null);
    setCaption("");
    setTags("");
    setVideoPreview(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showEditor} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRecording ? "Recording Video" : "Upload Video"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isRecording ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video 
                  ref={videoPreviewRef} 
                  className="w-full h-full object-contain" 
                  muted 
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={stopRecording}
                  >
                    Stop Recording
                  </Button>
                </div>
              </div>
            ) : videoPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video 
                  src={videoPreview} 
                  className="w-full h-full object-contain" 
                  controls 
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-primary/80 hover:bg-primary"
                    onClick={() => setShowEditor(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      URL.revokeObjectURL(videoPreview);
                      setVideoPreview(null);
                      setVideoFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button 
                    className="h-24 flex flex-col gap-2" 
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8" />
                    <span>Upload Video</span>
                  </Button>
                  
                  <Button 
                    className="h-24 flex flex-col gap-2" 
                    variant="outline"
                    onClick={startRecording}
                  >
                    <Camera className="h-8 w-8" />
                    <span>Record Video</span>
                  </Button>
                </div>
                
                <Input 
                  ref={videoInputRef}
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </div>
            )}

            {(videoFile || isRecording) && !isRecording && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea 
                    id="caption"
                    placeholder="Add a caption to your video"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags"
                    placeholder="fun, trending, challenge"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {videoFile && !isRecording && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Post Video"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditor && (
        <VideoEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            if (videoPreview) {
              URL.revokeObjectURL(videoPreview);
            }
            setVideoFile(null);
            setVideoPreview(null);
            onClose();
          }}
          onSuccess={onSuccess}
          initialVideo={videoFile}
        />
      )}
    </>
  );
};

export default VideoUpload;
