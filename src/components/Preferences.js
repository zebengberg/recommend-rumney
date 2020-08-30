import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import RankedRoute from "./RankedRoute";

export default () => {
  const [preferences, setPreferences] = useState({});
  return (
    <Container className="p-3">
      <h1>Preferences</h1>
      <Row>
        <RankedRoute />
      </Row>
    </Container>
  );
};
