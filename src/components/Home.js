import React from "react";
import { Jumbotron, Button, Card } from "react-bootstrap";
import Link from "react-router-dom/Link";
import users from "../data/users.json";
import Autocomplete from "./Autocomplete";

export default () => (
  <>
    <Jumbotron>
      <h1>recommend rumney!</h1>
      <p>
        You've already sent those boring jug hauls and painful slabs. Want a
        custom recommendation for an amazing route you haven't yet tried??
      </p>
      <p>
        <Link to="/algorithm">
          <Button variant="info">How it works</Button>
        </Link>
      </p>
    </Jumbotron>

    <div style={{ padding: "2rem 1rem", "margin-bottom": "2rem" }}>
      <Card style={{ padding: "2rem 1rem", "margin-bottom": "2rem" }}>
        <Card.Title>Already a contributor?</Card.Title>
        <Card.Body>Search for your Mountain Project username below.</Card.Body>
        <Autocomplete items={users} />
      </Card>

      <Card style={{ padding: "2rem 1rem", "margin-bottom": "2rem" }}>
        <Card.Title>Build your own custom preferences.</Card.Title>
        <Link to="/preferences">
          <Button size="lg" style={{ float: "right" }}>
            Build Route Preferences
          </Button>
        </Link>
      </Card>
    </div>
  </>
);
