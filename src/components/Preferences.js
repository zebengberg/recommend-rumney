import React from "react";
import Autocomplete from "./Autocomplete";
import routes from "../assets/routes.json";

export default () => {
  return <Autocomplete items={routes} />;
};
