import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import Link from "react-router-dom/Link";
import Slider, { gradeToNumber, gradeList } from "./Slider";

export default (props) => {
  const [lower, setLower] = useState(0);
  const [upper, setUpper] = useState(gradeList.length - 1);
  const recommendations = props.location.recommendations;
  const [filteredRecs, setFilteredRecs] = useState(recommendations);

  useEffect(() => {
    if (recommendations !== undefined) {
      setFilteredRecs(
        recommendations.filter((route) => {
          const grade = gradeToNumber(route[1].grade);
          return grade <= upper && grade >= lower;
        })
      );
    }
  }, [lower, upper, recommendations]);

  return (
    <Container>
      <h1 style={{ margin: 50 }}>Recommendations</h1>
      {recommendations === undefined ? (
        <Alert variant="warning">
          No preferences recorded. Please go to the{" "}
          <Link to="/preferences">preferences page</Link> to log your opinions.
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
          <p>
            The recommendation algorithm sorts the routes below according to a
            predicted number of stars you'd give them.
          </p>
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Grade</th>
                <th>Predicted Stars</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map(([route, routeInfo]) => (
                <tr key={route}>
                  <td>
                    <a href={routeInfo.url}>{route.slice(0, 52)}</a>
                  </td>
                  <td>{routeInfo.grade}</td>
                  <td>{routeInfo.prediction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Container>
  );
};
