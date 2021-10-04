import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import home from "../images/home.png";

const Home = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "3rem",
          flexDirection: "column",
        }}
      >
        <div>
          <Link to="/login" style={{ textDecoration: "none", margin: "1rem" }}>
            <Button variant="contained" color="primary">
              Login
            </Button>
          </Link>
          <Link
            to="/register"
            style={{ textDecoration: "none", margin: "1rem" }}
          >
            <Button variant="outlined" color="primary">
              Register
            </Button>
          </Link>
        </div>
        <img
          style={{ width: "70%", height: "auto", marginTop: "2rem" }}
          src={home}
          alt="Hackathon Info"
        />
      </div>
    </>
  );
};

export { Home };
