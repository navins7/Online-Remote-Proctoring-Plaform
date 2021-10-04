import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import { Header } from "./Header.jsx";
import { postRequest } from "../utils/serviceCall";
import { Divider } from "@material-ui/core";

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

const InvDashboard = () => {
  const [exams, setExam] = useState([]);
  const [open, setOpen] = useState({ status: false, index: -1 });
  const [currentExam, setCurrentExam] = useState([]);
  const history = useHistory();

  const handleOpen = (index) => {
    setCurrentExam(exams[index]);
    setOpen({ status: true, index });
  };

  const handleClose = () => {
    setOpen({ status: false, index: -1 });
  };

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
      allowBrightnessDim: exam.allowBrightnessDim,
      allowHeadMovement: exam.allowHeadMovement,
      allowVoice: exam.allowVoice,
      allowBrowserSizeChange: exam.allowBrowserSizeChange,
      allowTabSwitch: exam.allowTabSwitch,
      headMovementCount: exam.headMovementCount,
      tabSwitchCount: exam.tabSwitchCount,
      browserSwitchCount: exam.browserSwitchCount,
      brighnessDimCount: exam.brighnessDimCount,
    }));
    setExam(examList);
  };

  const modifyExam = async () => {
    const data = {
      examId: currentExam.id,
      allowBrightnessDim: currentExam.allowBrightnessDim,
      allowHeadMovement: currentExam.allowHeadMovement,
      allowVoice: currentExam.allowVoice,
      allowBrowserSizeChange: currentExam.allowBrowserSizeChange,
      allowTabSwitch: currentExam.allowTabSwitch,
      headMovementCount: parseInt(currentExam.headMovementCount),
      tabSwitchCount: parseInt(currentExam.tabSwitchCount),
      browserSwitchCount: parseInt(currentExam.browserSwitchCount),
      brighnessDimCount: parseInt(currentExam.brighnessDimCount),
    };
    await postRequest("api/exam/modify", data);
    handleClose();
    getExams();
  };

  const startExam = (examID) => {
    history.push({
      pathname: "/inv/start",
      state: { examID: examID },
    });
  };

  useEffect(() => {
    getExams();
  }, []);

  const getCards = () =>
    exams.map((exam, index) => (
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
          {exam.isActive && (
            <Button
              size="small"
              color="secondary"
              variant="contained"
              onClick={() => startExam(exam.id)}
            >
              Start Invigilation
            </Button>
          )}
          {!exam.isActive && (
            <Button size="small" color="secondary" variant="contained" disabled>
              {exam.isComplete ? "Exam Completed" : "Start Invigilation"}
            </Button>
          )}
          <IconButton aria-label="share" onClick={() => handleOpen(index)}>
            <EditIcon color="primary" />
          </IconButton>
        </CardActions>
      </Card>
    ));

  const classes = useStyles();
  return (
    <>
      <Header />

      <Dialog
        maxWidth="lg"
        open={open.status}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Modify Online-Proctoring Configuration
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" component="h2">
            {currentExam.title}
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            {currentExam.duration}
          </Typography>
          <Typography variant="body2" component="p">
            Start : {currentExam.startTime}
          </Typography>
          <Typography
            variant="body2"
            style={{ marginBottom: "1rem" }}
            component="p"
          >
            End : {currentExam.endTime}
          </Typography>
          <Divider style={{ marginBottom: "2rem" }} />
          <div style={{ marginBottom: "2rem" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentExam.allowTabSwitch}
                  onChange={(event) =>
                    setCurrentExam({
                      ...currentExam,
                      allowTabSwitch: event.target.checked,
                    })
                  }
                  name="checkedB"
                  color="primary"
                />
              }
              label="Allow Tab Switch"
            />
            <TextField
              id="standard-basic1"
              label="End exam after"
              style={{ marginLeft: "2rem" }}
              value={currentExam.tabSwitchCount}
              onChange={(event) =>
                setCurrentExam({
                  ...currentExam,
                  tabSwitchCount: event.target.value,
                })
              }
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentExam.allowBrowserSizeChange}
                  onChange={(event) =>
                    setCurrentExam({
                      ...currentExam,
                      allowBrowserSizeChange: event.target.checked,
                    })
                  }
                  name="checkedB"
                  color="primary"
                />
              }
              label="Allow Browser Size Change"
            />
            <TextField
              id="standard-basic2"
              label="End exam after"
              style={{ marginLeft: "2rem" }}
              value={currentExam.browserSwitchCount}
              onChange={(event) =>
                setCurrentExam({
                  ...currentExam,
                  browserSwitchCount: event.target.value,
                })
              }
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentExam.allowBrightnessDim}
                  onChange={(event) =>
                    setCurrentExam({
                      ...currentExam,
                      allowBrightnessDim: event.target.checked,
                    })
                  }
                  name="checkedB"
                  color="primary"
                />
              }
              label="Allow Low Brightness"
            />
            <TextField
              id="standard-basic3"
              label="End exam after"
              style={{ marginLeft: "2rem" }}
              value={currentExam.brighnessDimCount}
              onChange={(event) =>
                setCurrentExam({
                  ...currentExam,
                  brighnessDimCount: event.target.value,
                })
              }
            />
          </div>
          {!currentExam.allowBrightnessDim && (
            <div style={{ marginBottom: "2rem" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentExam.allowHeadMovement}
                    onChange={(event) =>
                      setCurrentExam({
                        ...currentExam,
                        allowHeadMovement: event.target.checked,
                      })
                    }
                    name="checkedB"
                    color="primary"
                  />
                }
                label="Allow unnecessary head movement"
              />
              <TextField
                id="standard-basic4"
                label="End exam after"
                style={{ marginLeft: "2rem" }}
                value={currentExam.headMovementCount}
                onChange={(event) =>
                  setCurrentExam({
                    ...currentExam,
                    headMovementCount: event.target.value,
                  })
                }
              />
            </div>
          )}
          <div style={{ marginBottom: "2rem" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentExam.allowVoice}
                  onChange={(event) =>
                    setCurrentExam({
                      ...currentExam,
                      allowVoice: event.target.checked,
                    })
                  }
                  name="checkedB"
                  color="primary"
                />
              }
              label="Allow Voice"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={modifyExam} color="primary">
            Modify
          </Button>
        </DialogActions>
      </Dialog>

      <div className={classes.container}>{getCards()}</div>
    </>
  );
};

export { InvDashboard };
