import React, { useEffect, useState } from "react";
import { postRequest } from "../utils/serviceCall";
import "../styles/env.css";

const LoadExam = (props) => {
  const [timer, setTimer] = useState(5);
  const {
    callback,
    setQuestions,
    setExamDetail,
    setAnswer,
    setTimeElapsed,
    examId,
  } = props;

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (timer !== -1) setTimer((timer) => timer - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [timer]);

  useEffect(() => {
    postRequest("api/exam/details", { examId: examId }).then((res) => {
      setExamDetail(res.data.exam);
    });
  }, [examId, setExamDetail]);

  useEffect(() => {
    postRequest("api/exam/question", { examId: examId }).then((res) => {
      setQuestions(res.data.questions);
      postRequest("api/exam/fetch/answer", {
        examId: examId,
      }).then((response) => {
        const answerMap = res.data.questions.map((question) => {
          return { questionId: question.id, optionId: "" };
        });
        const answers = response.data.answers;
        let previouslySavedAnswers = answers;
        const savedAnswerMap = answerMap.map((ans) => {
          let optionId = "";
          const findSavedAnswer = previouslySavedAnswers.filter(
            (answ) => answ.questionId === ans.questionId
          );
          if (findSavedAnswer.length > 0) {
            optionId = `${findSavedAnswer[0].optionId}`;
            return { questionId: ans.questionId, optionId: optionId };
          }
          return ans;
        });
        setAnswer(savedAnswerMap);
      });
    });
  }, [examId, setAnswer, setQuestions]);

  useEffect(() => {
    postRequest("api/exam/fetch/attempt", { examId: examId }).then((res) => {
      const attempt = res.data.attempt;
      if (!attempt) {
        postRequest("api/exam/attempt", {
          examId: examId,
        }).then(() => {});
      } else {
        setTimeElapsed(attempt.timeElapsed);
      }
    });
  }, [examId, setTimeElapsed]);

  useEffect(() => {
    if (timer === -1) {
      callback();
    }
  }, [callback, timer]);

  return (
    <div className="load_container">
      <h2 className="load_header">
        Your exam will begin in {timer} {timer > 1 ? "seconds" : "second"}
      </h2>
      <h3 style={{ textDecoration: "underline" }}>Instructions</h3>
      <div className="env_points">
        <li>Do not exit fullscreen mode</li>
        <li>Do not block access to camera and audio</li>
        <li>Do not use a mobile phone during the examination</li>
        <li>Do not switch tabs once the exam begins</li>
        <li>
          Test ethics violation and user movement is reported to the invigilator
        </li>
        <li>
          In case of network loss, close your browser and start the test again
        </li>
        <li>
          In case of issues in the user environment, we may ask again to
          validate the test environment again
        </li>
        <li>
          Answers will be auto submitted on switching questions and at the end
          of test
        </li>
      </div>
    </div>
  );
};

export { LoadExam };
