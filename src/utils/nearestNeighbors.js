import starsObject from "../assets/data/user_rating_object.json";

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

    const penalty = 0;

    dist += penalty;
    dist++; // TODO: do something better here!
    return { ...acc, [user]: { dist, influence } };
  }, {});
}

/* Returns an array of route names sorted in reverse by their recommendation. */
export default function (preferences, initialRoutesArray) {
  const weights = getWeights(preferences);

  // Object to populate with scores
  let routesAsObjects = initialRoutesArray.reduce(
    (acc, cur) => ({ ...acc, [cur.route]: { ...cur, score: 0, maxScore: 0 } }),
    {}
  );
  routesAsObjects = Object.entries(starsObject).reduce(
    (acc, [user, routeObject]) => {
      for (const route in routeObject) {
        const multiplier = (1 / weights[user].dist) * weights[user].influence;
        acc[route].score += routeObject[route] * multiplier;
        acc[route].maxScore += multiplier;
      }
      return acc;
    },
    routesAsObjects
  );

  return Object.values(routesAsObjects).map((object) => {
    const predictions = {
      ...object,
      neighborPrediction: object.maxScore ? object.score / object.maxScore : 0,
    };
    delete predictions.score;
    delete predictions.maxScore;
    return predictions;
  });
}
