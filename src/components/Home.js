import React, { useState } from "react";
import { Jumbotron, Button, Row, Container } from "react-bootstrap";
import Link from "react-router-dom/Link";
import Autocomplete from "./Autocomplete";
import users from "../assets/users.json";
import fly from "../assets/fly.jpg";

export default () => {
  const [user, setUser] = useState({});
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

      <Container>
        <h3>Already a contributor?</h3>
        <p>Search for your Mountain Project username below.</p>
        <Autocomplete
          items={users}
          itemKey={"user"}
          sortKey={"n_votes"}
          setSelected={setUser}
        />
        {"item" in user && (
          <p>
            Wow, congratulations <b>{user.item}</b>! You have given star ratings
            to <b>{user.measure}</b> routes in the Mountain Project Rumney
            database. You are {adjective(user.measure)} user.
          </p>
        )}

        <Row style={{ marginTop: "5rem" }}>
          <Link to="/preferences">
            <Button size="lg">Build your own custom preferences.</Button>
          </Link>
        </Row>
      </Container>
    </>
  );
};

const adjective = (measure) => {
  if (measure > 100) {
    return "an exceptional";
  }
  if (measure > 20) {
    return "a distinguished";
  }
  if (measure > 5) {
    return "a capable";
  } else {
    return "an uncommitted";
  }
};
