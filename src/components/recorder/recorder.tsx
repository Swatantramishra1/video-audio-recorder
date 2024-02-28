import React, { useState, useRef, useEffect } from "react";

type RecordedChunks = Blob[];
type Recording = {
  id: string;
  url: string;
};

const VideoRecorder: React.FC<{ handleSavedData: () => void }> = ({
  handleSavedData,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPause, setIsPause] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<RecordedChunks>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  let permissionDenied = false;

  const generateId = () => {
    return "_" + Math.random().toString(36).substr(2, 9);
  };

  const startRecording = async () => {
    try {
      if (permissionDenied) {
        setErrorMessage(
          "Please enable camera permissions in your browser settings."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsRecording(true);
      setErrorMessage("");
      let tempMedioRecorder = null;
      tempMedioRecorder = new MediaRecorder(stream);
      tempMedioRecorder.ondataavailable = handleDataAvailable;
      tempMedioRecorder.start();
      setMediaRecorder(tempMedioRecorder);
    } catch (error) {
      permissionDenied = true;
      setMediaRecorder(null);

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage(
          "Permission to access camera was denied. Please enable camera permissions in your browser settings."
        );
      } else {
        setErrorMessage("Error accessing camera.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }

    if (videoRef.current) {
      videoRef.current.pause(); // Pause the video
      videoRef.current.srcObject = null; // Set video source to null
    }

    setPausedTime(null);
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      if (videoRef.current) {
        setPausedTime(videoRef.current.currentTime);
        videoRef.current.pause();
      }
      setIsPause(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      if (videoRef.current) {
        if (pausedTime !== null) {
          videoRef.current.currentTime = pausedTime;
        }
        videoRef.current.play();
      }
      setIsPause(false);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    // addWatermark();
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_video.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    console.log(url, "url");
    saveRecordingToLocal();
    setRecordedChunks([]);
  };

//   const addWatermark = () => {
//     const video = videoRef.current;
//         const canvas = canvasRef.current;
//         if (!video || !canvas) return;

//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;

//         ctx.drawImage(video, 0, 0);

//         const watermarkText = 'Allen Digital'; 

//         ctx.font = '30px Arial';
//         ctx.fillStyle = 'white';
//         ctx.fillText(watermarkText, 10, video.videoHeight - 10);

        
//         const watermarkedVideoUrl = canvas.toDataURL('video/webm');

        
//         const link = document.createElement('a');
//         link.href = watermarkedVideoUrl;
//         link.download = 'watermarked_video.webm';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
// };

  const saveRecordingToLocal = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const id = generateId();

    setRecordings((prevRecordings) => [...prevRecordings, { id, url }]);
    setRecordedChunks([]);
  };

  useEffect(() => {
    localStorage.setItem("recordings", JSON.stringify(recordings));
    handleSavedData();
  }, [recordings]);

  return (
    <div className="recorderContainer">
      <div className="firstColumnRec">
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        {!errorMessage && isRecording ? (
          <>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
            {isPause ? (
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ml-4"
                onClick={resumeRecording}
              >
                Resume Recording
              </button>
            ) : (
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ml-4"
                onClick={pauseRecording}
              >
                Pause Recording
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              onClick={startRecording}
            >
              {isRecording ? "Recording..." : "Start Recording"}
            </button>
            {recordedChunks.length > 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-4"
                onClick={downloadRecording}
              >
                Download Recording
              </button>
            )}
          </>
        )}
      </div>
      <div className="secondColumnRec">
        <div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
        <video
          ref={videoRef}
          className="border border-gray-500 video"
          controls
          autoPlay={true}
        />
      </div>
    </div>
  );
};

export default VideoRecorder;
