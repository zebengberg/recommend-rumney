import React, { useState } from "react";
import { Jumbotron, Button, Row, Container, Col } from "react-bootstrap";
import NavBar from "./NavBar";
import Link from "react-router-dom/Link";
import Autocomplete from "./Autocomplete";
import users_array from "../assets/users_array.json";
import fly from "../assets/fly.jpg";

export default () => {
  const [isContributor, setIsContributor] = useState(null);
  const [userValue, setUserValue] = useState("");
  const [userObject, setUserObject] = useState({});

  return (
    <>
      <NavBar />
      <Jumbotron
        style={{
          backgroundSize: "cover",
          backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.2), rgba(255,255,255,0.7)), url(${fly})`,
        }}
      >
        <Container>
          <h1 style={{ fontSize: "100px" }}>recommend rumney!</h1>
          <p>Get a custom recommendation for a new route.</p>
        </Container>
      </Jumbotron>

      <Container style={{ margin: "2rem" }}>
        <Row>
          <Col>
            <h3>Already an active Mountain Project contributor at Rumney?</h3>
          </Col>
          <Col>
            <Button size="lg" onClick={() => setIsContributor(true)}>
              yes
            </Button>{" "}
            <Button size="lg" onClick={() => setIsContributor(false)}>
              no
            </Button>
          </Col>
        </Row>
      </Container>

      {isContributor === true && (
        <Container style={{ paddingBottom: "20rem" }}>
          <p>Find your username below.</p>
          <Autocomplete
            value={userValue}
            setValue={setUserValue}
            setItem={setUserObject} // placeholder; could use this to grab data on user
            items={users_array}
            itemKey={"user"}
            sortKey={"n_votes"}
          />
          {userObject.n_votes !== undefined && (
            <p>
              Hello <b>{userValue}</b>! You have given star ratings to{" "}
              <b>{userObject.n_votes}</b> routes in the Mountain Project Rumney
              database.
            </p>
          )}
        </Container>
      )}

      {isContributor === false && (
        <Container style={{ margin: "5em" }}>
          <Link to="/preferences">
            <Button size="lg" variant="success">
              Build your custom preferences
            </Button>
          </Link>
        </Container>
      )}
    </>
  );
};
