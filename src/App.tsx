import { useEffect, useState } from "react";
import VideoRecorder from "./components/recorder/recorder.tsx";
import "./App.css";
type Recording = {
  id: string;
  url: string;
};

function App() {

  const [recordings, setRecordings] = useState<Recording[]>([]);

  const retrieveRecordingsFromLocal = () => {
    const savedRecordings = localStorage.getItem("recordings");
    if (savedRecordings) {
      setRecordings(JSON.parse(savedRecordings));
    }
  };

  useEffect(() => {
    retrieveRecordingsFromLocal();
  }, []);

  console.log(recordings, "recordings");

  return (
    <div className="containerPage">
       <VideoRecorder handleSavedData={retrieveRecordingsFromLocal} />
    </div>
  );
}

export default App;

