import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Autocomplete from "./Autocomplete";
import Stars from "./Stars";
import routes from "../assets/routes.json";
import { Button } from "react-bootstrap";

export default (props) => {
  const [route, setRoute] = useState("");
  const [rating, setRating] = useState(0);

  return (
    <Row>
      <Col>
        <Autocomplete
          value={route}
          setValue={setRoute}
          items={routes}
          itemKey={"route"}
          sortKey={"n_votes"}
          inputProps={{ style: { width: "20rem" } }}
        />
      </Col>

      <Col>
        <Stars rating={rating} setRating={setRating} />
      </Col>
      <Col>
        <Button
          onClick={(e) => {
            console.log(e);
            setRoute("");
            console.log("clicked clear");
            setRating(0);
          }}
        >
          clear
        </Button>
      </Col>
    </Row>
  );
};
