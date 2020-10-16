import React, { useState, useEffect } from "react";
import { Container, Alert, ToggleButton } from "react-bootstrap";
import Jumbotron from "react-bootstrap/Jumbotron";
import Link from "react-router-dom/Link";
import NavBar from "./NavBar";
import Slider, { gradeToNumber, gradeList } from "./Slider";
import SortableTable from "./SortableTable";
import urban from "../assets/img/urban2.jpeg";

export default (props) => {
  const [lower, setLower] = useState(0);
  const [upper, setUpper] = useState(gradeList.length - 1);
  const recommendations = props.location.recommendations;
  const preferences = props.location.preferences;
  const [filteredRecs, setFilteredRecs] = useState(recommendations);
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    if (recommendations !== undefined) {
      setFilteredRecs(
        recommendations.filter((route) => {
          if (!checked && route.route in preferences) {
            return false;
          }
          const grade = gradeToNumber(route.grade);
          return grade <= upper && grade >= lower;
        })
      );
    }
  }, [lower, upper, checked, recommendations, preferences]);

  return (
    <>
      <NavBar />
      <Jumbotron
        style={{
          backgroundSize: "cover",
          backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.2), rgba(255,255,255,0.7)), url(${urban})`,
        }}
      >
        <Container>
          <h1>recommendations</h1>
        </Container>
      </Jumbotron>

      <Container>
        {recommendations === undefined ? (
          <Alert variant="warning">
            No preferences recorded. Please go to the{" "}
            <Link to="/preferences">preferences page</Link> to log your
            opinions.
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
            <ToggleButton
              type="checkbox"
              variant="info"
              size="sm"
              checked={checked}
              onChange={(e) => setChecked(e.currentTarget.checked)}
            >
              Include your preferences in the results below?
            </ToggleButton>

            <SortableTable data={filteredRecs.slice(0, 50)} />
          </>
        )}
      </Container>
    </>
  );
};
