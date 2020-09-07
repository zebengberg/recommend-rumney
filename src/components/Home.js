import React, { useState } from "react";
import { Jumbotron, Button, Row, Container, Col } from "react-bootstrap";
import Link from "react-router-dom/Link";
import Autocomplete from "./Autocomplete";
import users_array from "../assets/users_array.json";
import fly from "../assets/fly.jpg";

export default () => {
  const [userValue, setUserValue] = useState("");
  const [userObject, setUserObject] = useState({});

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
          <Link to="/about">
            <Button variant="info">How it works</Button>
          </Link>
        </p>
      </Jumbotron>

      <Container>
        <h3>Already a contributor?</h3>
        <p>Search for your Mountain Project username below.</p>
        <Autocomplete
          value={userValue}
          setValue={setUserValue}
          setItem={setUserObject} // placeholder; could use this to grab data on user
          items={users_array}
          itemKey={"user"}
          sortKey={"n_votes"}
        />
        {userObject.n_votes !== null && (
          <p>
            Wow, congratulations <b>{userValue}</b>! You have given star ratings
            to <b>{userObject.n_votes}</b> routes in the Mountain Project Rumney
            database. You are {adjective(userObject.n_votes)} user.
          </p>
        )}

        <Row style={{ marginTop: "5rem" }}>
          <Col>
            <Link to="/preferences">
              <Button size="lg">Build your own custom preferences</Button>
            </Link>
          </Col>
          {userObject.n_votes !== null && (
            <Col>
              <Link to="/implement-this">
                <Button size="lg">Use your existing ratings</Button>
              </Link>
            </Col>
          )}
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
