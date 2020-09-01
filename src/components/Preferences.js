import React, { useState } from "react";
import { Container, Row, Button } from "react-bootstrap";
import RankedRoute from "./RankedRoute";

export default () => {
  const [routeList, setRouteList] = useState([{ route: "", rating: 0 }]);
  console.log(routeList);
  if (
    routeList[routeList.length - 1].route &&
    routeList[routeList.length - 1].rating
  ) {
    setRouteList([...routeList, { route: "", rating: 0 }]);
  }

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

      <Button>Get recommendation</Button>
    </Container>
  );
};
