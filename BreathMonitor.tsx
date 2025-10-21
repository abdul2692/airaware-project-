import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Video, VideoOff, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BreathMonitor = () => {
  const navigate = useNavigate();
  const [bpm, setBpm] = useState<number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const measurementsRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsMonitoring(true);
      toast.success("Camera started. Place your finger over the camera.");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsMonitoring(false);
    setBpm(null);
    measurementsRef.current = [];
  };

  const calculateBPM = () => {
    if (!videoRef.current || !canvasRef.current || !isMonitoring) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(calculateBPM);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    
    const pixelCount = data.length / 4;
    const avgRed = r / pixelCount;
    
    measurementsRef.current.push(avgRed);
    
    if (measurementsRef.current.length > 256) {
      measurementsRef.current.shift();
    }

    const now = Date.now();
    if (now - lastTimeRef.current > 2000 && measurementsRef.current.length > 60) {
      lastTimeRef.current = now;
      const peaks = detectPeaks(measurementsRef.current);
      
      if (peaks.length >= 2) {
        const avgInterval = peaks.reduce((sum, peak, i) => {
          if (i === 0) return sum;
          return sum + (peak - peaks[i - 1]);
        }, 0) / (peaks.length - 1);
        
        const calculatedBpm = Math.round(60 / (avgInterval / 30));
        
        if (calculatedBpm >= 40 && calculatedBpm <= 200) {
          setBpm(calculatedBpm);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(calculateBPM);
  };

  const detectPeaks = (data: number[]) => {
    const peaks: number[] = [];
    const threshold = data.reduce((a, b) => a + b) / data.length;
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    
    return peaks;
  };

  useEffect(() => {
    if (isMonitoring) {
      calculateBPM();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMonitoring]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          ← Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Activity className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Breath <span className="gradient-text">Monitor</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Monitor your heart rate using your device camera
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card p-8 text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Current BPM</p>
              <p className="text-5xl font-bold gradient-text">
                {bpm || "--"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">beats per minute</p>
            </Card>

            <Card className="glass-card p-8">
              <h3 className="font-semibold mb-4">Instructions:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Click "Start Monitoring" to enable camera</li>
                <li>Place your fingertip over the camera lens</li>
                <li>Keep still and ensure good lighting</li>
                <li>Wait 5-10 seconds for accurate reading</li>
              </ol>
            </Card>
          </div>

          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isMonitoring && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                {!isMonitoring ? (
                  <Button
                    onClick={startCamera}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    size="lg"
                    variant="destructive"
                  >
                    <VideoOff className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </Button>
                )}
              </div>

              {bpm && (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    {bpm < 60 && "💙 Your heart rate is below normal range"}
                    {bpm >= 60 && bpm <= 100 && "💚 Your heart rate is normal"}
                    {bpm > 100 && "❤️ Your heart rate is elevated"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BreathMonitor;
