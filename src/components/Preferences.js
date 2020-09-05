import React, { useState } from "react";
import { Container, Row, Button, Alert, Spinner } from "react-bootstrap";
import Link from "react-router-dom/Link";
import RankedRoute from "./RankedRoute";
import LoadingButton from "./LoadingButton";
import getRecommendations, { routeListToObject } from "../algorithm";

export default () => {
  const [routeList, setRouteList] = useState([
    { route: "", grade: "", rating: 0 },
  ]);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  // Add a new <RankedRoute> if the last one has been filled.
  // Reset the warning alert
  if (
    routeList[routeList.length - 1].route &&
    routeList[routeList.length - 1].rating
  ) {
    setRouteList([...routeList, { route: "", grade: "", rating: 0 }]);
    setSubmitButtonClicked(false);

    var minRequired = 5;
    setAllowSubmit(
      Object.keys(routeListToObject(routeList)).length >= minRequired
    );
  }

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

      {routeList.map((routeObject, index) => (
        <Row key={index /* very very import to have this key! */}>
          <RankedRoute
            index={index}
            setRoute={(newRoute, passedIndex) => {
              const newRouteList = [...routeList];
              newRouteList[passedIndex] = {
                route: newRoute.route,
                grade: newRoute.grade,
              };
              setRouteList(newRouteList);
            }}
            rating={routeObject.rating}
            setRating={(newRating, passedIndex) => {
              const newRouteList = [...routeList];
              newRouteList[passedIndex].rating = newRating;
              setRouteList(newRouteList);
            }}
          />
        </Row>
      ))}

      <LoadingButton
        text={"Get Recommendations"}
        routeList={routeList}
        setRecommendations={setRecommendations}
        allowSubmit={allowSubmit}
      />

      {/* <ConditionalLink
        to={{
          pathname: "/recommendation",
          recommendations: recommendations,
        }}
        condition={allowSubmit}
      >
        <Button
          onClick={() => {
            setSubmitButtonClicked(true);
            if (allowSubmit && submitButtonClicked) {
              setRecommendations(
                getRecommendations(routeListToObject(routeList))
              );
            }
          }}
        >
          {allowSubmit && submitButtonClicked ? (
            <Spinner
              as="span"
              animation="border"
              size="lg"
              role="status"
              aria-hidden="false"
            />
          ) : (
            <div>Get Recommendation</div>
          )}
        </Button>
      </ConditionalLink>
      {!allowSubmit && submitButtonClicked && (
        <Alert variant="warning">
          You must complete preferences for {minRequired} distinct routes to
          continue. So far you have only completed preferences for{" "}
          {Object.keys(routeListToObject(routeList)).length} distinct routes.
        </Alert>
      )} */}
    </Container>
  );
};
