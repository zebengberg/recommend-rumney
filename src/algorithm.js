import stars from "./assets/stars.json";
import routes from "./assets/routes.json";

/* Determine routes in common to user1 and user2. */
const getIntersection = (user1, user2) =>
  //Object.keys(user1).filter((k) => k in user2);
  Object.keys(user1).filter({}.hasOwnProperty.bind(user2));

/* Calculate the dot product of user1[keys] and user2[keys]. */
const getDot = (user1, user2, keys) => {
  const products = keys.map((key) => user1[key] * user2[key]);
  return products.reduce((a, b) => a + b, 0);
};

/* Calculate the cosine of the angle between user1[keys] and user2[keys]. */
const getAngle = (user1, user2, keys) => {
  const dot = getDot(user1, user2, keys);
  const norm1 = getDot(user1, user1, keys);
  const norm2 = getDot(user2, user2, keys);
  return dot / Math.pow(norm1 * norm2, 0.5);
};

/* Return an object of the form {user: weightedAngle}. */
const getWeights = (preferences) => {
  // Considering users who have reviewed routes in preferences.
  return Object.keys(stars).reduce((acc, cur) => {
    // Influence of the user is the log of the number of routes rated.
    const influence = Math.log2(Object.keys(stars[cur]).length);

    const intersection = getIntersection(stars[cur], preferences);

    // Avoiding dividing by zero in definition of getAngle.
    const weightedAngle = intersection.length
      ? influence * getAngle(stars[cur], preferences, intersection)
      : 0;

    return { ...acc, [cur]: weightedAngle };
  }, {});
};

/* Returns an array of route names sorted in reverse by their recommendation. */
export default (preferences) => {
  const weights = getWeights(preferences);

  // Object with route names as keys and all values as 0.
  let recommendations = routes.reduce(
    (acc, cur) => ({ ...acc, [cur.route]: 0 }),
    {}
  );

  // Populating the recommendations object.
  recommendations = Object.entries(stars).reduce((acc, [user, routeObject]) => {
    for (const route in routeObject) {
      acc[route] += routeObject[route] * weights[user];
    }
    return acc;
  }, recommendations);

  // Transforming into entries array in order to sort.
  // A route appears earlier in the array if it has a higher recommendation.
  recommendations = Object.entries(recommendations);
  recommendations = recommendations.sort((a, b) => b[1] - a[1]);

  // Picking off just the route name, which will be returned as an array.
  // TODO: do something with the score
  return recommendations.map(([route, score]) => route);
};
