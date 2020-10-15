import slopeOne from "./slopeOne";
import nearestNeighbors from "./nearestNeighbors";
import contentSimilarity from "./contentSimilarity";
import routesArray from "../assets/data/route_data_array.json";

/* Transform array of {route, rating} objects into a single object of
the form {route: rating} */
function routeListToObjectOfRatings(routeList) {
  const validList = routeList.filter((item) => item.route && item.rating);
  return validList.reduce(
    (acc, item) => ({ ...acc, [item.route]: item.rating }),
    {}
  );
}

/* Run all recommendation algorithms. */
function getRecommendations(preferences) {
  // Recommendations gets populated with new predictions for each algorithm.
  let recommendations = routesArray;
  recommendations = slopeOne(preferences, recommendations);
  recommendations = nearestNeighbors(preferences, recommendations);
  recommendations = contentSimilarity(preferences, recommendations);

  // Taking average of all recommendations
  // TODO: generalize this
  // Not very functional!
  recommendations.forEach((o) => {
    o.avgPrediction =
      (o.neighborPrediction + o.slopeOnePrediction + o.contentPrediction) / 3;
  });

  // removing preferences from recommendations
  for (const route in preferences) {
    delete recommendations[route];
  }

  recommendations = recommendations.map((object) => {
    Object.keys(object).forEach((key) => {
      if (typeof object[key] === "number") {
        object[key] = object[key].toFixed(2); // toFixed converts to string
      }
    });
    return object;
  });
  return recommendations;
}

export { getRecommendations, routeListToObjectOfRatings };
