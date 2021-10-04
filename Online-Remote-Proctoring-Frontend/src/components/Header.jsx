import React from "react";
import Button from "@material-ui/core/Button";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { logoutFunc } from "../actions/authentication.action";
import "../styles/header.css";

const Header = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <div className="dashboard_header">
      <h3 className="dashboard_product">Online Proctoring System</h3>
      <Button
        className="dashboard_logout_btn"
        variant="contained"
        color="primary"
        onClick={() => {
          dispatch(logoutFunc());
          history.push({
            pathname: "/login",
            state: { message: "Logged out successfully" },
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export { Header };
