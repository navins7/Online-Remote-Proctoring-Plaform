import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import "../styles/mcq.css";

const MultipleChoiceQuestion = (props) => {
  const { question, currentId, selectedAnswer, answerMCQ } = props;

  const getOptions = () =>
    question.options.map((option) => (
      <FormControlLabel
        value={`${option.id}`}
        key={option.id}
        control={<Radio />}
        label={option.text}
      />
    ));
  return (
    <div className="mcq_container">
      <h3 className="mcq_question">
        <span className="mcq_question_no">{currentId + 1})</span>{" "}
        {question.text}
      </h3>
      <div className="mcq_options">
        <RadioGroup
          name="answer"
          value={selectedAnswer.optionId}
          onChange={(event) => answerMCQ(question.id, event.target.value)}
        >
          {getOptions()}
        </RadioGroup>
      </div>
    </div>
  );
};

export { MultipleChoiceQuestion };
