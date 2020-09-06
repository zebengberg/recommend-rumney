import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import RankedRoute from "./RankedRoute";
import LoadingButton from "./LoadingButton";
import { routeListToObject } from "../algorithm";

// Minimum number of preferences before allowing submission
const minRequired = 2;

export default () => {
  const [routeList, setRouteList] = useState([
    { route: "", grade: "", rating: 0 },
  ]);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);

  // Add a new <RankedRoute> if the last one has been filled.
  useEffect(() => {
    if (
      routeList[routeList.length - 1].route &&
      routeList[routeList.length - 1].rating
    ) {
      setRouteList([...routeList, { route: "", grade: "", rating: 0 }]);
      setSubmitButtonClicked(false); // reset the button to hide alert
      setAllowSubmit(
        Object.keys(routeListToObject(routeList)).length >= minRequired
      );
    }
  }, [routeList]);

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
                rating: 0, // could also keep the current value here if modifying
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
        routeList={routeList}
        allowSubmit={allowSubmit}
        submitButtonClicked={submitButtonClicked}
        setSubmitButtonClicked={setSubmitButtonClicked}
        minRequired={minRequired}
      />
    </Container>
  );
};
