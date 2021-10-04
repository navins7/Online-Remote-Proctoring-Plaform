import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Login } from "./Login.jsx";
import { Registration } from "./Registration.jsx";
import { Home } from "./Home.jsx";
import { AuthenticatedRoute } from "./AuthenticatedRoute.jsx";
import { Dashboard } from "./Dashboard.jsx";
import { InvDashboard } from "./InvigilatorDashboard.jsx";
import { Invigilate } from "./Invigilate.jsx";
import { Test } from "./Test.jsx";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" exact>
          <Login />
        </Route>
        <Route path="/register" exact>
          <Registration />
        </Route>
        <Route path="/dashboard" exact>
          <AuthenticatedRoute
            forUser="student"
            path="/dashboard"
            Component={Dashboard}
          />
        </Route>
        <Route path="/exam" exact>
          <AuthenticatedRoute path="/exam" forUser="student" Component={Test} />
        </Route>
        <Route path="/inv/dashboard" exact>
          <AuthenticatedRoute
            path="/inv/dashboard"
            forUser="invigilator"
            Component={InvDashboard}
          />
        </Route>
        <Route path="/inv/start" exact>
          <AuthenticatedRoute
            path="/inv/start"
            forUser="invigilator"
            Component={Invigilate}
          />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
