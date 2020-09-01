import React, { useState } from "react";
import { Container, Row, Button, Alert } from "react-bootstrap";
import Link from "react-router-dom/Link";
import RankedRoute from "./RankedRoute";

export default () => {
  const [routeList, setRouteList] = useState([{ route: "", rating: 0 }]);
  const [buttonClicked, setButtonClicked] = useState(false);

  // Add a new <RankedRoute> if the last one has been filled.
  // Reset the warning alert
  if (
    routeList[routeList.length - 1].route &&
    routeList[routeList.length - 1].rating
  ) {
    setRouteList([...routeList, { route: "", rating: 0 }]);
    setButtonClicked(false);
  }

  // Determine if sufficient route preferences are given for submission.
  const minDistinctRoutesRequired = 5;

  // Helper function
  const getValidAndDistinctEntries = (list) => {
    const validList = list.filter((o) => o.route && o.rating);
    // Using filter for routeNames to avoid empty string as name
    const routeNames = validList.map((o) => o.route).filter((o) => o);
    const firstIndices = routeNames.map((name) => routeNames.indexOf(name));
    const firstIndicesNoDuplicates = [...new Set(firstIndices)];
    return firstIndicesNoDuplicates.map((i) => validList[i]);
  };

  const ConditionalLink = ({ children, to, condition }) =>
    condition && to ? <Link to={to}>{children}</Link> : <>{children}</>;

  return (
    <Container className="p-3">
      <h1>Preferences</h1>
      <p>
        In order to get a recommendation, you need to provide the algorithm some
        of your current preferences. Enter several Rumney routes for which you
        have strong opinions (positive or negative) below.
      </p>
      <Row>
        {routeList.map((routeObject, index) => (
          <RankedRoute
            key={index.toString()}
            index={index}
            route={routeObject.route}
            setRoute={(newRoute, passedIndex) => {
              const routeListCopy = [...routeList];
              routeListCopy[passedIndex].route = newRoute;
              setRouteList(routeListCopy);
            }}
            rating={routeObject.rating}
            setRating={(newRating, passedIndex) => {
              const routeListCopy = [...routeList];
              routeListCopy[passedIndex].rating = newRating;
              setRouteList(routeListCopy);
            }}
          />
        ))}
      </Row>
      <ConditionalLink
        to={{
          pathname: "/results",
          state: { preferences: getValidAndDistinctEntries(routeList) },
        }}
        condition={
          getValidAndDistinctEntries(routeList).length >=
          minDistinctRoutesRequired
        }
      >
        <Button onClick={(e) => setButtonClicked(true)}>
          Get Recommendation
        </Button>
      </ConditionalLink>
      {getValidAndDistinctEntries(routeList).length <
        minDistinctRoutesRequired &&
        buttonClicked && (
          <Alert variant="warning">
            You must complete preferences for {minDistinctRoutesRequired}{" "}
            distinct routes to continue. So far you have only completed
            preferences for {getValidAndDistinctEntries(routeList).length}{" "}
            distinct routes.
          </Alert>
        )}
    </Container>
  );
};
