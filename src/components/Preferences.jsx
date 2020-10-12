import React, { useState, useEffect } from "react";
import { Container, Row, Button } from "react-bootstrap";
import NavBar from "./NavBar";
import RankedRoute from "./RankedRoute";
import LoadingButton from "./LoadingButton";
import { routeListToObjectOfRatings } from "../algorithm";

// Minimum number of preferences before allowing submission
const minRequired = 1;

export default () => {
  // Reloading previous state after pressing back button from recommendations.
  const initialRouteList =
    window.history.state !== null
      ? window.history.state
      : [{ route: "", rating: 0 }];

  const [routeList, setRouteList] = useState(initialRouteList);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);

  // Add a new <RankedRoute> if the last one has been filled.
  useEffect(() => {
    window.history.replaceState(routeList, ""); // in order to reload after back
    setAllowSubmit(
      Object.keys(routeListToObjectOfRatings(routeList)).length >= minRequired
    );
    if (
      routeList[routeList.length - 1].route &&
      routeList[routeList.length - 1].rating
    ) {
      setRouteList([...routeList, { route: "", rating: 0 }]);
      setSubmitButtonClicked(false); // reset the button to hide alert
    }
  }, [routeList]);

  return (
    <>
      <NavBar />
      <Container className="p-3">
        <h1>Preferences</h1>
        <Row style={{ marginBottom: 50 }}>
          <p>
            In order to get a recommendation, you need to provide the algorithm
            some of your current preferences. Enter several Rumney routes for
            which you have strong opinions (positive or negative) below.
          </p>

          <Button onClick={() => setRouteList([{ route: "", rating: 0 }])}>
            Reset all
          </Button>
        </Row>

        {routeList.map((routeObject, index) => (
          <Row key={index /* very very import to have this key! */}>
            <RankedRoute
              index={index}
              value={routeObject.route}
              setRoute={(newRoute, passedIndex) => {
                const newRouteList = [...routeList];
                newRouteList[passedIndex].route = newRoute.route;
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
          ratingsObject={routeListToObjectOfRatings(routeList)}
          allowSubmit={allowSubmit}
          submitButtonClicked={submitButtonClicked}
          setSubmitButtonClicked={setSubmitButtonClicked}
          minRequired={minRequired}
        />
      </Container>
    </>
  );
};
