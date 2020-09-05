import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import getRecommendations, { routeListToObject } from "../algorithm";

function simulateNetworkRequest() {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

export default (props) => {
  const [isLoading, setLoading] = useState(false);

  const getRecs = async () => {
    console.log("hihi");
    const routesAsObject = routeListToObject(props.routeList);
    console.log(routesAsObject);
    return await getRecommendations(routesAsObject);
  };

  useEffect(() => {
    if (isLoading) {
      console.log("here");
      getRecs().then((recs) => {
        setLoading(false);
        props.setRecommendations(recs);
        console.log(recs);
      });
    }
  });

  const handleClick = () => setLoading(true);

  return (
    <Button
      variant="primary"
      disabled={isLoading}
      onClick={!isLoading ? handleClick : null}
    >
      {isLoading ? "Calculating....." : props.text}
    </Button>
  );
};
