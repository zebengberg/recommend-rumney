import React, { useState } from "react";
import { Jumbotron, Button, Card } from "react-bootstrap";
import Link from "react-router-dom/Link";
import Autocomplete from "./Autocomplete";
import users from "../assets/users.json";
import fly from "../assets/fly.jpg";

export default () => {
  const [selectedUser, setSelectedUser] = useState(null);
  console.log(selectedUser);
  return (
    <>
      <Jumbotron
        style={{
          backgroundSize: "cover",
          backgroundImage: `linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255,0.7)), url(${fly})`,
        }}
      >
        <h1>recommend rumney!</h1>
        <p>
          Want a custom recommendation for an amazing route you haven't yet
          tried??
        </p>
        <p>
          <Link to="/algorithm">
            <Button variant="info">How it works</Button>
          </Link>
        </p>
      </Jumbotron>

      <div style={{ padding: "2rem 1rem", marginBottom: "2rem" }}>
        <Card style={{ padding: "2rem 1rem", marginBottom: "2rem" }}>
          <Card.Title>Already a contributor?</Card.Title>
          <Card.Body>
            Search for your Mountain Project username below.
          </Card.Body>
          <Autocomplete
            items={users}
            item_key={"user"}
            sort_key={"n_votes"}
            selected={selectedUser}
            setSelected={setSelectedUser}
          />

          <p>
            Wow, congratulations {selectedUser}! Have this display iff we get
            user. Print number of contribs. Take to next page.
          </p>
        </Card>
        <Card style={{ padding: "2rem 1rem", marginBottom: "2rem" }}>
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
};
