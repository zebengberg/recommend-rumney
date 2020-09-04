import React, { useState } from "react";
import { Container, Alert } from "react-bootstrap";
import Link from "react-router-dom/Link";
import getRecommendations from "../algorithm";
import Slider from "./Slider";

export default (props) => {
  const [lower, setLower] = useState(0);
  const [upper, setUpper] = useState(0);

  // TODO: put all of this into preference file
  const testPreferences = [
    { route: "Yoda", rating: 3 },
    { route: "Piece of Cake", rating: 1 },
    { route: "Arugula, Arugula", rating: 2 },
    { route: "Chloe's Breakfast Special", rating: 1 },
    { route: "B-B-Buttress", rating: 4 },
  ];

  //const preferences = props.location.preferences;

  // Transforming list of {route, rating} objects into a single object.
  let reducer = (accumulator, currentValue) => ({
    ...accumulator,
    [currentValue.route]: currentValue.rating,
  });
  const preferences = testPreferences.reduce(reducer, {});
  // Only keeping some of the array
  const recommendations = getRecommendations(preferences).slice(0, 50);

  console.log(recommendations);

  return (
    <Container>
      <h1>Recommendations</h1>
      {preferences === undefined ? (
        <Alert variant="warning">
          No preferences recorded. Please go to the{" "}
          <Link to="/preferences">preferences page</Link> to log your opionions.
        </Alert>
      ) : (
        <>
          <p>Use the slider to filter by grade.</p>
          <Slider
            lower={lower}
            setLower={setLower}
            upper={upper}
            setUpper={setUpper}
          />
          {/* <ol>
            {recommendations.map((route) => (
              <li key={route}>{route}</li>
            ))}
          </ol> */}
        </>
      )}
    </Container>
  );
};
