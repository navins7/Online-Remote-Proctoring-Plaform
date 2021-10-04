import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import "../styles/authentication.css";
import "../styles/Registration.css";
import { postRequest } from "../utils/serviceCall";
import { useHistory } from "react-router-dom";

const videoConstraints = {
  facingMode: "user",
};

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [error, setError] = useState("");

  const webcamRef = useRef(null);
  const history = useHistory();

  const register = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (email.length === 0) {
      setError("Email Address cannot be empty");
      return;
    }
    if (password.length === 0) {
      setError("Password cannot be empty");
      return;
    }
    if (confirmPassword.length === 0) {
      setError("Confirm Password cannot be empty");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (imgSrc.length === 0) {
      setError("Please capture your image");
      return;
    }
    if (error.length !== 0) setError("");
    fetch(imgSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "user.jpeg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("image", file);
        formData.append("email", email);
        formData.append("password", password);
        postRequest("auth/register", formData)
          .then((_res) => {
            history.push({
              pathname: "/login",
              state: { message: "You have registered successfully" },
            });
          })
          .catch((err) => {
            setError(err.response.data.error);
          });
      });
  };

  const mediaError = () => {
    setError(
      "Please allow access to your webcam and wait for your webcam to start"
    );
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  return (
    <>
      <Link className="goBackLink" to="/">
        <button className="goBackBtn">
          <span style={{ fontSize: "20px", marginRight: "10px" }}>&#8592;</span>
          <p>Go Back</p>
        </button>
      </Link>
      <div className="container">
        <div className="loginform">
          <h2 className="formhead">Register</h2>
          {error.length !== 0 && <p className="errorMsg">{error}</p>}
          <label className="label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            className="inp"
            type="email"
            name="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="inp"
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <label className="label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            className="inp"
            type="password"
            name="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {imgSrc.length === 0 && (
            <>
              <Webcam
                audio={false}
                videoConstraints={videoConstraints}
                screenshotFormat="image/jpeg"
                ref={webcamRef}
                screenshotQuality={1}
                onUserMediaError={mediaError}
              />

              <button className="captureBtn" onClick={capture}>
                Capture photo
              </button>
            </>
          )}
          {imgSrc.length !== 0 && (
            <>
              <img src={imgSrc} alt="User captured" className="userImage" />
              <button className="captureBtn" onClick={() => setImgSrc("")}>
                Recapture
              </button>
            </>
          )}
          <button type="button" className="form-submit" onClick={register}>
            Register
          </button>
        </div>
      </div>
    </>
  );
};

export { Registration };
