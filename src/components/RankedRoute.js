import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Autocomplete from "./Autocomplete";
import Stars from "./Stars";
import routes from "../assets/routes.json";
import { Button } from "react-bootstrap";

export default (props) => {
  const [autocompleteValue, setAutocompleteValue] = useState("");
  return (
    <Row>
      <Col>
        <Autocomplete
          value={autocompleteValue}
          setValue={setAutocompleteValue}
          setItem={(newRoute) => props.setRoute(newRoute, props.index)}
          items={routes}
          itemKey={"route"}
          sortKey={"n_votes"}
          inputProps={{ style: { width: "20rem" } }}
        />
      </Col>

      <Col>
        <Stars
          rating={props.rating}
          setRating={(newRating) => props.setRating(newRating, props.index)}
        />
      </Col>

      <Col>
        <Button
          onClick={(e) => {
            props.setRoute({}, props.index);
            props.setRating(0, props.index);
            setAutocompleteValue("");
          }}
        >
          clear
        </Button>
      </Col>
    </Row>
  );
};
