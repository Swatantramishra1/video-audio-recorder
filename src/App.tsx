import { useEffect, useState } from "react";
import VideoRecorder from "./components/recorder/recorder.tsx";
import "./App.css";
type Recording = {
  id: string;
  url: string;
};

function App() {
  const [count, setCount] = useState(0);

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
      <div className="firstColumn">
        <VideoRecorder handleSavedData={retrieveRecordingsFromLocal} />
      </div>
      {/* <div className="secondColumn">
        {recordings.map((recording) => (
          <Card recording={recording} />
        ))}
      </div> */}
    </div>
  );
}

export default App;

const Card = ({ recording }: { recording: Recording }) => {

  async function objectUrlToBlob(objectUrl: string) {
    // Fetch the data from the Object URL
    const response = await fetch(objectUrl);
  
    // Convert the fetched data to a Blob
    const blob = await response.blob();
  
    return blob;
  }

  const handleOpenRecordings = () => {
    objectUrlToBlob(recording.url).then(blob => {
      // Use the Blob as needed
      console.log(blob);

      const blobUrl = URL.createObjectURL(blob);

      // Open the Blob URL in a new tab
      window.open(blobUrl);
  
      // Optionally, revoke the object URL when you're done with it to free up memory
      URL.revokeObjectURL(blobUrl);
    });
   
  };
  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg bg-white"
      onClick={() => handleOpenRecordings()}
    >
      <img
        className="w-full"
        src="https://via.placeholder.com/350x150"
        alt="Placeholder"
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{recording.id}</div>
        <p className="text-gray-700 text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut commodo
          sapien sed sapien viverra, et mollis nisl congue.
        </p>
      </div>
    </div>
  );
};
