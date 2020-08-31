import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import RankedRoute from "./RankedRoute";

export default () => {
  const [preferences, setPreferences] = useState({});
  return (
    <Container className="p-3">
      <h1>Preferences</h1>
      <p>
        In order to get a recommendation, you need to provide the algorithm some
        of your current preferences. Enter several Rumney routes for which you
        have strong opinions (positive or negative) below.
      </p>
      <Row>
        <RankedRoute />
      </Row>
      <Button>Get recommendation</Button>
    </Container>
  );
};
