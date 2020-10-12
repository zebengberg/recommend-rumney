import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

import Home from "./components/Home";
import Preferences from "./components/Preferences";
import Recommendation from "./components/Recommendation";

export default () => (
  <Router>
    <Route exact path="/" component={Home} />
    <Route path="/preferences" component={Preferences} />
    <Route path="/recommendation" component={Recommendation} />
  </Router>
);
