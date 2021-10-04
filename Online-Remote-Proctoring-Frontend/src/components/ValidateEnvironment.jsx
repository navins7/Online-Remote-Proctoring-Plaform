import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "@material-ui/core/Button";
import Webcam from "react-webcam";
import { socket } from "../constants/socket";
import Swal from "sweetalert2";
import "../styles/env.css";

// Go to full screen
// Check if camera is on
// Check if microphone is on
// Check if sound is working
// Check if brightness of camera is correct ( Flask )

const videoConstraints = {
  facingMode: "user",
};

const microphonethresholdVolume = 30;

const ValidateEnvironment = (props) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [isSoundWorking, setIsSoundWorking] = useState(false);
  const [isBrightnessCorrect, setIsBrightnessCorrect] = useState(false);
  const [startValidation, setStartValidation] = useState(false);
  const [countMicrophoneValidVolume, setCountMicrophoneValidVolume] = useState(
    0
  );
  const [error, setError] = useState("");
  const webcamRef = useRef(null);
  const { callback, size, message } = props;

  const goFullScreen = (element) => {
    const requestMethod =
      element.requestFullScreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullScreen;
    if (requestMethod) {
      // Native full screen.
      requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") {
      // Older IE.
      var wscript = new window.ActiveXObject("WScript.Shell");
      if (wscript !== null) {
        wscript.SendKeys("{F11}");
      }
    }
    if (!startValidation) {
      setStartValidation(true);
    }
  };

  const handleMediaError = () => {
    setError("Please allow camera and microphone access");
  };

  const handleMediaSuccess = () => {
    if (error.length > 0) setError("");
    if (!isCameraOn) setIsCameraOn(true);
  };

  const validateAudio = () => {
    const audio = new Audio(
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    );
    audio.play();
    Swal.fire({
      title: "Can you hear the sound?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        audio.pause();
        setIsSoundWorking(true);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        audio.pause();
      }
    });
  };

  // Colors audio bars
  const colorPids = useCallback((vol) => {
    if (vol > 30) {
      setCountMicrophoneValidVolume(
        (countMicrophoneValidVolume) => countMicrophoneValidVolume + 1
      );
    }
    let all_pids = [...document.querySelectorAll(".pid")];
    if (all_pids.length === 0) return;
    let amout_of_pids = Math.round(vol / 10);
    let elem_range = all_pids.slice(0, amout_of_pids);
    for (let i = 0; i < all_pids.length; i++) {
      all_pids[i].style.backgroundColor = "#e6e7e8";
    }
    for (let i = 0; i < elem_range.length; i++) {
      elem_range[i].style.backgroundColor = "#69ce2b";
    }
  }, []);

  // Checks if platform is fullscreen
  useEffect(() => {
    if (window.screen.height === size[1]) {
      if (!isFullScreen) {
        setIsFullScreen(true);
      }
    } else {
      setIsFullScreen(false);
    }
  }, [isFullScreen, size]);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    return imageSrc;
  }, [webcamRef]);

  useEffect(() => {
    const transmitImage = setInterval(() => {
      const imageSrc = capture();
      if (imageSrc) {
        socket.emit("brightness validation", imageSrc, (res) => {
          if (res !== isBrightnessCorrect) {
            setIsBrightnessCorrect(res);
          }
        });
      }
    }, 1000 / process.env.REACT_APP_FPS);
    return () => clearInterval(transmitImage);
  }, [capture, isBrightnessCorrect]);

  // Checks for audio streams
  useEffect(() => {
    if (!isMicrophoneOn && startValidation) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          window.localStream = stream;
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);
          javascriptNode.addEventListener("audioprocess", function () {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += array[i];
            }

            var average = values / length;

            colorPids(average);
          });
        })
        .catch(function (err) {});
    }
  }, [colorPids, isMicrophoneOn, startValidation]);

  // approves the microphone
  useEffect(() => {
    if (
      countMicrophoneValidVolume > microphonethresholdVolume &&
      !isMicrophoneOn
    ) {
      setIsMicrophoneOn(true);
    }
  }, [countMicrophoneValidVolume, isMicrophoneOn]);

  // stops the audio listener
  useEffect(() => {
    if (isMicrophoneOn) {
      window.localStream.getAudioTracks()[0].stop();
    }
  }, [isMicrophoneOn]);

  if (
    isFullScreen &&
    isCameraOn &&
    isMicrophoneOn &&
    isSoundWorking &&
    isBrightnessCorrect
  ) {
    callback();
    return null;
  }
  if (!startValidation) {
    return (
      <div className="env_container">
        <h2 className="env_header">
          The system environment will be validated before starting the exam
        </h2>
        {message.length > 0 && (
          <h3 style={{ color: "red", marginBottom: "1rem" }}>{message}</h3>
        )}
        <div className="env_points">
          <li>Whether platform is fullscreen or not</li>
          <li>Whether camera is switched on or not</li>
          <li>Whether user environment has adequate brightness</li>
          <li>Whether microphone is switched on or not</li>
          <li>Whether user system's audio is switched on or not</li>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => goFullScreen(document.body)}
        >
          Start Validation
        </Button>
      </div>
    );
  }
  return (
    <div className="env_container">
      <h1 className="env_header">Validating the environment</h1>
      {error.length > 0 && (
        <h3 style={{ color: "red", marginBottom: "1rem" }}>{error}</h3>
      )}
      {!isFullScreen && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => goFullScreen(document.body)}
        >
          Go Full Screen
        </Button>
      )}
      <div className="env_split">
        <div className="env_half_split env_reverse_split">
          <Webcam
            audio={true}
            videoConstraints={videoConstraints}
            onUserMediaError={handleMediaError}
            onUserMedia={handleMediaSuccess}
            ref={webcamRef}
          />
          {!isMicrophoneOn && (
            <>
              <h3 style={{ fontWeight: 300, marginTop: "2rem" }}>
                Please say something to validate your microphone
              </h3>
              <div className="pids-wrapper">
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
                <div className="pid"></div>
              </div>
            </>
          )}
          {isMicrophoneOn && !isSoundWorking && (
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: "2rem" }}
              onClick={() => validateAudio()}
            >
              Check Audio
            </Button>
          )}
        </div>
        <div className="env_half_split">
          <div className="env_points">
            <li>
              Whether platform is fullscreen or not {isFullScreen ? "✅" : "❌"}
            </li>
            <li>
              Whether camera is switched on or not {isCameraOn ? "✅" : "❌"}
            </li>
            <li>
              Whether user environment has adequate brightness{" "}
              {isBrightnessCorrect ? "✅" : "❌"}
            </li>
            <li>
              Whether microphone is switched on or not{" "}
              {isMicrophoneOn ? "✅" : "❌"}
            </li>
            <li>
              Whether user system's audio is switched on or not{" "}
              {isSoundWorking ? "✅" : "❌"}
            </li>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ValidateEnvironment };
