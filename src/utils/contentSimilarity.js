import simObject from "../assets/data/content_similarities_object.json";

/* Make recommendation using previously calculated content similarities between
routes.*/
export default function (preferences, initialRoutesArray) {
  return initialRoutesArray.map((route2) => {
    // return the given preference when route2 is included in preferences
    if (route2.route in preferences) {
      return { ...route2, contentPrediction: preferences[route2.route] };
    }

    // there are two possible keys to consider
    const key1 = (route1) => route1 + " " + route2.route;
    const key2 = (route1) => route2.route + " " + route1;
    const keys = [key1, key2];
    let max = 0;

    for (const route1 in preferences) {
      for (const key of keys) {
        if (key(route1) in simObject) {
          // giving a +1 bonus
          const score = preferences[route1] * simObject[key(route1)] + 1;
          max = Math.max(max, score);
        }
      }
    }

    let prediction = max;
    prediction = Math.min(prediction, 4); // clipping
    prediction = Math.max(prediction, 0); // clipping
    return { ...route2, contentPrediction: prediction };
  });
}
