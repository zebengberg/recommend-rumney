import React, { useState } from "react";
import Autocomplete from "./Autocomplete";
import routes from "../assets/routes.json";

export default () => {
  return <Autocomplete items={routes} />;
};
