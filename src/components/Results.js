import React from "react";
import { Container, Alert } from "react-bootstrap";
import Link from "react-router-dom/Link";
import getRecommendations from "../algorithm";

const testPreferences = [
  { route: "Yoda", rating: 3 },
  { route: "Piece of Cake", rating: 1 },
  { route: "Arugula, Arugula", rating: 2 },
  { route: "Chloe's Breakfast Special", rating: 1 },
  { route: "B-B-Buttress", rating: 4 },
];

export default (props) => {
  //const preferences = props.location.preferences;

  // Transforming list of {route, rating} objects into a single object.
  let reducer = (accumulator, currentValue) => ({
    ...accumulator,
    [currentValue.route]: currentValue.rating,
  });
  const preferences = testPreferences.reduce(reducer, {});
  const recommendations = getRecommendations(preferences);

  return (
    <Container>
      <h1>Recommendations</h1>
      {preferences === undefined ? (
        <Alert variant="warning">
          No preferences recorded. Please go to the{" "}
          <Link to="/preferences">preferences page</Link> to log your opionions.
        </Alert>
      ) : (
        <ol>
          {recommendations.map((route) => (
            <li key={route}>{route}</li>
          ))}
        </ol>
      )}
    </Container>
  );
};
