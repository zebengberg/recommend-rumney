import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

import Home from "./components/Home";
import Algorithm from "./components/Algorithm";
import Preferences from "./components/Preferences";

export default () => (
  <Router>
    <Route exact path="/" component={Home} />
    <Route path="/algorithm" component={Algorithm} />
    <Route path="/preferences" component={Preferences} />
  </Router>
);
