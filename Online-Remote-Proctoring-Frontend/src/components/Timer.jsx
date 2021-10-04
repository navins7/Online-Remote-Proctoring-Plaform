import React from "react";
import "../styles/timer.css";

const Timer = (props) => {
  const { totalSeconds } = props;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return (
    <div className="timer_container">
      <h2>
        Time Left :{" "}
        <span className="timer_time">
          {minutes} : {seconds < 10 ? "0" : ""}
          {seconds}
        </span>
      </h2>
    </div>
  );
};

export { Timer };
