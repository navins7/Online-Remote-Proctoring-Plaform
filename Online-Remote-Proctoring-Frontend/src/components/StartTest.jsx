import React, { useCallback, useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import Webcam from "react-webcam";
import { socket } from "../constants/socket";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import Pagination from "@material-ui/lab/Pagination";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { StudentVideoCall } from "./StudentVideoCall.jsx";

import { postRequest } from "../utils/serviceCall";
import { Timer } from "./Timer.jsx";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion.jsx";
import calculatorLogo from "../images/keys.png";

import "../styles/test.css";
import Swal from "sweetalert2";

const videoConstraints = {
  facingMode: "user",
};

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const StartTest = (props) => {
  const {
    handleUserViolation,
    examDetail,
    questions,
    answer,
    answerMCQ,
    timeElapsed,
    addUserActivity,
    userEmail,
  } = props;
  const [timeLeft, setTimeLeft] = useState(
    examDetail.duration * 60 - timeElapsed
  );
  const { transcript } = useSpeechRecognition();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [awayTimer, setAwayTimer] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [error, setError] = useState("");
  const webcamRef = useRef(null);

  const history = useHistory();

  const handleChange = (_event, value) => {
    setCurrentQuestion(value - 1);
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot({
      width: 854,
      height: 480,
    });
    if (!imageSrc) return;
    return imageSrc;
  }, [webcamRef]);

  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });
  }, []);

  const endTest = () => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to end the test ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        postRequest("api/exam/end", { examId: examDetail.id }).then((_res) => {
          history.push({
            pathname: "/dashboard",
          });
        });
      }
    });
  };

  useEffect(() => {
    socket.on("end test request", () => {
      postRequest("api/exam/end", { examId: examDetail.id }).then((_res) => {
        history.push({
          pathname: "/dashboard",
        });
      });
    });
    // socket.on("user activity error message", (message) => {
    //   console.log(message);
    //   // setError(message.message);
    //   // setOpenSnackBar(true);
    // });
  });

  useEffect(() => {
    const transmitImage = setInterval(() => {
      const imageSrc = capture();
      if (imageSrc) {
        socket.emit(
          "exam validation",
          examDetail.id,
          userEmail,
          imageSrc,
          (status, msg, endFlag) => {
            if (endFlag) {
              postRequest("api/exam/end", { examId: examDetail.id }).then(
                (_res) => {
                  history.push({
                    pathname: "/dashboard",
                  });
                }
              );
            } else if (status) {
              if (error !== msg) {
                setError(msg);
                setOpenSnackBar(true);
              }
            }
          }
        );
      }
    }, 1000);
    return () => clearInterval(transmitImage);
  }, [capture, error, examDetail.id, history, userEmail]);

  useEffect(() => {
    const preventClick = (event) => {
      setError("Right click is disabled");
      setOpenSnackBar(true);
      addUserActivity("User tried to right click", 0);
      event.preventDefault();
    };
    document.addEventListener("contextmenu", preventClick);
    return () => document.removeEventListener("contextmenu", preventClick);
  }, [addUserActivity]);

  useEffect(() => {
    const elapseTimer = setInterval(() => {
      postRequest("api/exam/attempt", { examId: examDetail.id });
    }, 2000);
    return () => clearInterval(elapseTimer);
  }, [examDetail.id, isPageVisible]);

  useEffect(() => {
    if (!isPageVisible) {
      const awayTimerInterval = setInterval(
        () => setAwayTimer((awayTimer) => awayTimer + 1),
        1000
      );
      return () => clearInterval(awayTimerInterval);
    } else {
      if (awayTimer > 0) {
        setError(`You were away from the test for ${awayTimer} seconds`);
        setOpenSnackBar(true);
        addUserActivity(
          `User was away from the test for ${awayTimer} seconds`,
          2,
          "tab"
        );
        setAwayTimer(0);
      }
    }
  }, [addUserActivity, awayTimer, isPageVisible]);

  useEffect(() => {
    if (examDetail.allowTabSwitch) return;
    let browserPrefixes = ["moz", "ms", "o", "webkit"];

    // get the correct attribute name
    function getHiddenPropertyName(prefix) {
      return prefix ? prefix + "Hidden" : "hidden";
    }

    // get the correct event name
    function getVisibilityEvent(prefix) {
      return (prefix ? prefix : "") + "visibilitychange";
    }

    // get current browser vendor prefix
    function getBrowserPrefix() {
      for (let i = 0; i < browserPrefixes.length; i++) {
        if (getHiddenPropertyName(browserPrefixes[i]) in document) {
          // return vendor prefix
          return browserPrefixes[i];
        }
      }
      // no vendor prefix needed
      return null;
    }

    // bind and handle events
    let browserPrefix = getBrowserPrefix(),
      hiddenPropertyName = getHiddenPropertyName(browserPrefix),
      visibilityEventName = getVisibilityEvent(browserPrefix);

    function onVisible() {
      // prevent double execution
      if (isPageVisible) {
        return;
      }
      // change flag value
      setIsPageVisible(true);
    }

    function onHidden() {
      // prevent double execution
      if (!isPageVisible) {
        return;
      }
      // change flag value
      setIsPageVisible(false);
    }

    function handleVisibilityChange(forcedFlag) {
      // forcedFlag is a boolean when this event handler is triggered by a
      // focus or blur eventotherwise it's an Event object
      if (typeof forcedFlag === "boolean") {
        if (forcedFlag) {
          return onVisible();
        }
        return onHidden();
      }
      if (document[hiddenPropertyName]) {
        return onHidden();
      }
      return onVisible();
    }

    const listener1 = document.addEventListener(
      visibilityEventName,
      handleVisibilityChange,
      false
    );

    // extra event listeners for better behaviour
    const listener2 = document.addEventListener(
      "focus",
      function () {
        handleVisibilityChange(true);
      },
      false
    );

    const listener3 = document.addEventListener(
      "blur",
      function () {
        handleVisibilityChange(false);
      },
      false
    );

    const listener4 = window.addEventListener(
      "focus",
      function () {
        handleVisibilityChange(true);
      },
      false
    );

    const listener5 = window.addEventListener(
      "blur",
      function () {
        handleVisibilityChange(false);
      },
      false
    );
    return () => {
      window.removeEventListener("blur", listener4);
      window.removeEventListener("focus", listener5);
      document.removeEventListener(visibilityEventName, listener1);
      document.removeEventListener("focus", listener2);
      document.removeEventListener("blur", listener3);
    };
  }, [isPageVisible, examDetail]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((timeLeft) => timeLeft - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isPageVisible]);

  const getAnswerForQuestion = () => {
    return answer.filter(
      (ans) => ans.questionId === questions[currentQuestion].id
    )[0];
  };

  const closeCalculator = () => {
    setCalculatorOpen(false);
  };

  const handleMediaError = () => {
    handleUserViolation();
  };

  // const checkMedia = useCallback(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true, video: true })
  //     .then(function (stream) {
  //       if (
  //         stream.getVideoTracks().length <= 0 ||
  //         stream.getAudioTracks().length <= 0
  //       ) {
  //         handleUserViolation();
  //       }
  //     })
  //     .catch((_err) => {
  //       handleUserViolation();
  //     });
  // }, [handleUserViolation]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const closeTranscript = () => {
    setTranscriptOpen(false);
  };

  if (transcript.length > 30 && !examDetail.allowVoice) {
    postRequest("api/exam/end", { examId: examDetail.id }).then((_res) => {
      history.push({
        pathname: "/dashboard",
      });
    });
    return null;
  }

  return (
    <>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="warning">
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={!isPageVisible && awayTimer > 0}>
        <DialogContent>Away for {awayTimer} seconds</DialogContent>
      </Dialog>
      <Dialog open={calculatorOpen} onClose={closeCalculator} maxWidth="xl">
        <DialogContent className="calculator_actual">
          <p>
            <iframe
              title="calculator"
              src="https://www.desmos.com/testing/virginia/scientific"
              width="600"
              height="400"
            ></iframe>
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCalculator} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={transcriptOpen} onClose={closeTranscript}>
        <DialogContent className="transcript_actual">
          <h3 style={{ marginBottom: "20px" }}>User Voice Transcript</h3>
          <p>{transcript}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTranscript} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <div className="test_container">
        <h1 className="test_header">{examDetail.title}</h1>
        <div className="test_details">
          <h3>Duration : {examDetail.duration} minutes</h3>
          <h3>
            Start Time : {new Date(examDetail.startTime).toDateString()}
            {", "}
            {new Date(examDetail.startTime).toLocaleTimeString()}
          </h3>
          <h3>
            End Time : {new Date(examDetail.endTime).toDateString()}
            {", "}
            {new Date(examDetail.endTime).toLocaleTimeString()}
          </h3>
        </div>
      </div>
      <div className="question_container">
        <div className="test_meta">
          <div className="test_meta_split">
            <Timer totalSeconds={timeLeft} />
          </div>
          <div className="test_meta_split">
            <Pagination
              variant="outlined"
              color="primary"
              count={questions.length}
              page={currentQuestion + 1}
              onChange={handleChange}
            />
          </div>
          <div className="test_meta_split">
            <IconButton
              className="calculator_btn"
              onClick={() => setCalculatorOpen(true)}
            >
              <img
                src={calculatorLogo}
                alt="Calculator"
                className="calculator_logo"
              />
            </IconButton>
          </div>
        </div>
        <MultipleChoiceQuestion
          question={questions[currentQuestion]}
          selectedAnswer={getAnswerForQuestion()}
          currentId={currentQuestion}
          answerMCQ={answerMCQ}
        />
        {currentQuestion === 0 && (
          <Button
            className="navBtn"
            variant="outlined"
            color="primary"
            disabled
          >
            Previous
          </Button>
        )}
        {currentQuestion !== 0 && (
          <Button
            className="navBtn"
            variant="outlined"
            color="primary"
            onClick={() =>
              setCurrentQuestion((currentQuestion) => currentQuestion - 1)
            }
          >
            Previous
          </Button>
        )}
        {currentQuestion + 1 === questions.length && (
          <Button
            className="navBtn"
            variant="outlined"
            color="primary"
            disabled
          >
            Next
          </Button>
        )}
        {currentQuestion + 1 === questions.length && (
          <Button
            className="navBtn"
            variant="contained"
            color="secondary"
            onClick={endTest}
          >
            End Test
          </Button>
        )}
        {currentQuestion + 1 !== questions.length && (
          <Button
            className="navBtn"
            variant="outlined"
            color="primary"
            onClick={() =>
              setCurrentQuestion((currentQuestion) => currentQuestion + 1)
            }
          >
            Next
          </Button>
        )}
      </div>
      <div className="webcam_container">
        <IconButton
          className="calculator_btn"
          onClick={() => setTranscriptOpen(true)}
        >
          <RecordVoiceOverIcon fontSize="large" />
        </IconButton>
        <Webcam
          height={200}
          width={200}
          audio={true}
          videoConstraints={videoConstraints}
          screenshotFormat="image/jpeg"
          onUserMediaError={handleMediaError}
          ref={webcamRef}
        />
        <StudentVideoCall examId={examDetail.id} />
      </div>
    </>
  );
};

export { StartTest };
