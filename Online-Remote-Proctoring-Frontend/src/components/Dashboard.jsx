import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Header } from "./Header.jsx";
import { postRequest } from "../utils/serviceCall";

const useStyles = makeStyles({
  root: {
    width: 275,
    margin: "2.5rem",
    background: "rgb(250, 250, 250)",
    paddingBottom: "1rem",
  },
  container: {
    display: "flex",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const Dashboard = () => {
  const [exams, setExam] = useState([]);
  const history = useHistory();

  const getExams = async () => {
    const response = await postRequest("api/exam/");
    const examList = response.data.exams.map((exam) => ({
      title: exam.title,
      duration: `${exam.duration} mins`,
      startTime: `${new Date(exam.startTime).toDateString()} ${new Date(
        exam.startTime
      ).toLocaleTimeString()}`,
      endTime: `${new Date(exam.endTime).toDateString()} ${new Date(
        exam.endTime
      ).toLocaleTimeString()}`,
      isActive:
        new Date() >= new Date(exam.startTime) &&
        new Date() <= new Date(exam.endTime),
      id: exam.id,
      isComplete:
        exam.testAttempts.length !== 0 && exam.testAttempts[0].complete,
    }));
    setExam(examList);
  };

  const startExam = (examID) => {
    history.push({
      pathname: "/exam",
      state: { examID: examID },
    });
  };

  useEffect(() => {
    getExams();
  }, []);

  const getCards = () =>
    exams.map((exam) => (
      <Card key={exam.id} className={classes.root} variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2">
            {exam.title}
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            {exam.duration}
          </Typography>
          <Typography variant="body2" component="p">
            Start : {exam.startTime}
          </Typography>
          <Typography variant="body2" component="p">
            End : {exam.endTime}
          </Typography>
        </CardContent>
        <CardActions>
          {exam.isActive && !exam.isComplete && (
            <Button
              size="small"
              color="secondary"
              variant="contained"
              onClick={() => startExam(exam.id)}
            >
              Start Exam
            </Button>
          )}
          {!exam.isActive ||
            (exam.isComplete && (
              <Button
                size="small"
                color="secondary"
                variant="contained"
                disabled
              >
                {exam.isComplete ? "Exam Completed" : "Start Exam"}
              </Button>
            ))}
        </CardActions>
      </Card>
    ));

  const classes = useStyles();
  return (
    <>
      <Header />
      <div className={classes.container}>{getCards()}</div>
    </>
  );
};

export { Dashboard };
