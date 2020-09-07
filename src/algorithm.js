import stars_object from "./assets/stars_object.json";
import routes_array from "./assets/routes_array.json";
import std_object from "./assets/std_object.json";

/* Transform array of {route, rating} objects into a single object of
the form {route: rating} */
export function routeListToObjectOfRatings(routeList) {
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

/* Return an object of the form {user: weightedAngle}. */
function getWeights(preferences) {
  // Considering users who have reviewed routes in preferences.
  return Object.keys(stars_object).reduce((acc, user) => {
    // Influence of the user is the log of the number of routes rated.
    const influence = Math.log2(Object.keys(stars_object[user]).length);
    const intersection = getIntersection(stars_object[user], preferences);
    let dist = getDistance(stars_object[user], preferences, intersection);
    // Penalizing small intersection by adding in the standard deviation of
    // those routes within preferences and outside of user. The exact penality
    // here is somewhat aribtrary.
    const complementRoutes = Object.keys(preferences).filter(
      (route) => !intersection.includes(route)
    );

    const penalty = complementRoutes.reduce(
      (total, route) => total + std_object.route,
      0
    );

    dist += penalty;
    console.log(dist);

    // Avoiding dividing by zero in definition of getAngle.
    // let weightedAngle = intersection.length
    //   ? influence * getCosine(stars[user], preferences, intersection)
    //   : 0;
    let weightedAngle = 1;

    //console.log(weightedAngle);

    // TODO: finish this!!
    //const weightedDistance = intersection.length ? influence : 1;

    return { ...acc, [user]: weightedAngle };
  }, {});
}

/* Returns an array of route names sorted in reverse by their recommendation. */
export default (preferences) => {
  const weights = getWeights(preferences);

  // Object with key = route name and value = {grade, score} object.
  let recommendations = routes_array.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.route]: { grade: cur.grade, url: cur.url, score: 0 },
    }),
    {}
  );

  // Populating the recommendations object.
  recommendations = Object.entries(stars_object).reduce(
    (acc, [user, routeObject]) => {
      for (const route in routeObject) {
        acc[route].score += routeObject[route] * weights[user];
      }
      return acc;
    },
    recommendations
  );

  // Transforming into entries array in order to sort.
  // A route appears earlier in the array if it has a higher recommendation.
  recommendations = Object.entries(recommendations);
  recommendations = recommendations.sort((a, b) => b[1].score - a[1].score);

  return recommendations;
};
