import stars from "./assets/stars.json";
import routes from "./assets/routes.json";

/* Transforming list of {route, rating, grade} objects into a single object of
the form {route: {rating, grade}} */
export function routeListToObject(routeList) {
  const validList = routeList.filter((o) => o.route && o.rating);
  return validList.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.route]: { rating: cur.rating, grade: cur.grade },
    }),
    {}
  );
}

// Helper function
const getValidAndDistinctEntries = (list) => {
  const validList = list.filter((o) => o.route && o.rating);
  // Using filter for routeNames to avoid empty string as name
  const routeNames = validList.map((o) => o.route).filter((o) => o);
  const firstIndices = routeNames.map((name) => routeNames.indexOf(name));
  const firstIndicesNoDuplicates = [...new Set(firstIndices)];
  return firstIndicesNoDuplicates.map((i) => validList[i]);
};

/* Determine routes in common to user1 and user2. */
function getIntersection(user1, user2) {
  return Object.keys(user1).filter({}.hasOwnProperty.bind(user2));
}

/* Calculate taxicab distance between stars in user1 and user2 restricted to 
keys. The exact formula is taxicab metric - #keys / 2. This does not satisfy
the triangle inequality because the intersection keys have no transitivity.*/
function getDistance(user1, user2, keys) {
  const sum = keys.reduce(
    (sum, key) => sum + Math.abs(user1[key] - user2[key]),
    0
  );
  // TODO: make this fix better
  return sum - keys.length / 2 + 10; // add 10 to keep positive;
}

/* Calculate the dot product of user1[keys] and user2[keys]. */
function getDotProduct(user1, user2, keys) {
  const products = keys.map((key) => user1[key] * user2[key]);
  return products.reduce((a, b) => a + b, 0);
}

/* Calculate the cosine of the angle between user1[keys] and user2[keys]. */
function getCosine(user1, user2, keys) {
  const dot = getDotProduct(user1, user2, keys);
  const norm1 = getDotProduct(user1, user1, keys);
  const norm2 = getDotProduct(user2, user2, keys);
  return dot / Math.pow(norm1 * norm2, 0.5);
}

/* Return an object of the form {user: weightedAngle}. */
function getWeights(preferences) {
  // Considering users who have reviewed routes in preferences.
  return Object.keys(stars).reduce((acc, cur) => {
    // Influence of the user is the log of the number of routes rated.
    const influence = Math.log2(Object.keys(stars[cur]).length);

    const intersection = getIntersection(stars[cur], preferences);

    // Avoiding dividing by zero in definition of getAngle.
    const weightedAngle = intersection.length
      ? influence * getCosine(stars[cur], preferences, intersection)
      : 0;

    // TODO: finish this!!
    //const weightedDistance = intersection.length ? influence : 1;

    return { ...acc, [cur]: weightedAngle };
  }, {});
}

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

export const testRecommendations = [
  "Lonesome Dove",
  "Armed and Dangerous, and Off My Medication",
  "Yoda",
  "Underdog",
  "Junco",
  "Metamorphosis",
  "Oby-won Ryobi",
  "Masterpiece",
  "Waimea",
  "Clip a Dee Doo Dah",
  "Millenium Falcon",
  "Peer Pressure",
  "Jolt",
  "Sweet Polly Purebred",
  "Centerpiece",
  "Romancing the Stone",
  "Hippos on Parade",
  "Glory Jean's",
  "Lies and Propaganda",
  "War and  Peace",
  "Bolt Line",
  "Scene of the Crime",
  "Clusterphobia",
  "Tropicana",
  "Sesame Street",
  "Flying Hawaiian",
  "No Money Down",
  "The Big Easy",
  "Rise and Shine",
  "Espresso",
  "Know Ethics",
];
