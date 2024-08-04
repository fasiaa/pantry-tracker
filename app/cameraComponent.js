import { useRef, useState } from 'react';

const Camera = () => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const openCamera = async () => {
    setIsCameraOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
      track.stop();
    });

    videoRef.current.srcObject = null;
    setIsCameraOpen(false);
  };

  const takePicture = () => {
    const width = 640;
    const height = 480;
    const context = photoRef.current.getContext('2d');
    photoRef.current.width = width;
    photoRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);
    const dataURL = photoRef.current.toDataURL('image/png');
    setImageSrc(dataURL);
  };

  return (
    <div>
      <button onClick={openCamera}>Open Camera</button>
      <button onClick={closeCamera}>Close Camera</button>
      {isCameraOpen && (
        <div>
          <video ref={videoRef} style={{ width: '640px', height: '480px' }}></video>
          <button onClick={takePicture}>Take Picture</button>
          <canvas ref={photoRef} style={{ display: 'none' }}></canvas>
        </div>
      )}
      {imageSrc && (
        <div>
          <h2>Captured Image:</h2>
          <img src={imageSrc} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default Camera;