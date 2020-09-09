import starsObject from "./assets/stars_object.json";
import routesArray from "./assets/routes_array.json";
import stdObject from "./assets/std_object.json";
import slopeOneObject from "./assets/slope_one_object.json";

/* Transform array of {route, rating} objects into a single object of
the form {route: rating} */
function routeListToObjectOfRatings(routeList) {
  const validList = routeList.filter((item) => item.route && item.rating);
  return validList.reduce(
    (acc, item) => ({ ...acc, [item.route]: item.rating }),
    {}
  );
}

/* Determine routes in common to user1 and user2. Returns an array of route names. */
function getIntersection(user1, user2) {
  return Object.keys(user1).filter({}.hasOwnProperty.bind(user2));
}

/* Calculate taxicab distance between stars in user1 and user2 restricted to 
keys. */
function getDistance(user1, user2, keys) {
  return keys.reduce((sum, key) => sum + Math.abs(user1[key] - user2[key]), 0);
}

/* Return an object of the form {user: {dist, influence}}. */
function getWeights(preferences) {
  // Considering users who have reviewed routes in preferences.
  return Object.keys(starsObject).reduce((acc, user) => {
    // Influence of the user is the log of the number of routes rated.
    const influence = Math.log2(Object.keys(starsObject[user]).length);
    const intersection = getIntersection(starsObject[user], preferences);
    let dist = getDistance(starsObject[user], preferences, intersection);
    // Penalizing small intersection by adding in the standard deviation of
    // those routes within preferences and outside of user. The exact penality
    // here is somewhat aribtrary.
    const complementRoutes = Object.keys(preferences).filter(
      (route) => !intersection.includes(route)
    );

    const penalty = complementRoutes.reduce(
      (total, route) => total + stdObject[route],
      0
    );

    dist += penalty;
    dist++; // TODO: do something better here!
    return { ...acc, [user]: { dist, influence } };
  }, {});
}

/* Sort an object based on score key. Return type same as Object.entries() .*/
function sortPredictions(recs) {
  const asObject = recs.reduce(
    (acc, cur) => ({ ...acc, [cur.route]: cur }),
    {}
  );
  const asPairs = Object.entries(asObject);
  return asPairs.sort((a, b) => b[1].prediction - a[1].prediction);
}

/* Returns an array of route names sorted in reverse by their recommendation. */
function nearestNeighbors(preferences) {
  const weights = getWeights(preferences);

  const emptyRecommendations = routesArray.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.route]: { grade: cur.grade, url: cur.url, score: 0, maxScore: 0 },
    }),
    {}
  );
  let recommendations = Object.entries(starsObject).reduce(
    (acc, [user, routeObject]) => {
      for (const route in routeObject) {
        const multiplier = (1 / weights[user].dist) * weights[user].influence;
        acc[route].score += routeObject[route] * multiplier;
        acc[route].maxScore += multiplier;
      }
      return acc;
    },
    emptyRecommendations
  );

  recommendations = Object.entries(recommendations).map(([route, o]) => ({
    route: route,
    ...o,
    prediction: o.maxScore ? o.score / o.maxScore : 0,
  }));

  return sortPredictions(recommendations);
}

/* Make recommendation using previously calculated slope one parameters. */
function slopeOne(preferences) {
  const route2Array = routesArray;
  const recommendations = route2Array.map((route2) => {
    const key = (route1) => route1 + " " + route2.route; // helper function
    let route1Array = Object.entries(preferences).filter(
      ([route1, rating]) => key(route1) in slopeOneObject
    );

    route1Array = route1Array.map(
      ([route1, rating]) => rating - slopeOneObject[key(route1)]
    );

    // averaging over all route1
    const l = route1Array.length;
    const s = route1Array.reduce((sum, cur) => sum + cur, 0);
    // could give small bonus to more popular route2 here
    return l ? { ...route2, prediction: s / l } : { ...route2, prediction: 0 };
  });
  return sortPredictions(recommendations);
}

export { nearestNeighbors, slopeOne, routeListToObjectOfRatings };
