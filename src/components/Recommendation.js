import React, { useState } from "react";
import { Container, Alert } from "react-bootstrap";
import Link from "react-router-dom/Link";
import Slider from "./Slider";

export default (props) => {
  const [lower, setLower] = useState(0);
  const [upper, setUpper] = useState(0);

  const recommendations = props.location.recommendations;

  console.log(recommendations);

  return (
    <Container>
      <h1 style={{ margin: 50 }}>Recommendations</h1>
      {recommendations === undefined ? (
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
