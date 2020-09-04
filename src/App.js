import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

import Home from "./components/Home";
import About from "./components/About";
import Preferences from "./components/Preferences";
import Recommendation from "./components/Recommendation";

export default () => (
  <Router>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/preferences" component={Preferences} />
    <Route path="/recommendation" component={Recommendation} />
  </Router>
);
