import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

import Home from "./components/Home";
import About from "./components/About";
import Preferences from "./components/Preferences";
import Results from "./components/Results";

export default () => (
  <Router>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/preferences" component={Preferences} />
    <Route path="/results" component={Results} />
  </Router>
);
