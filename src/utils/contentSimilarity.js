import simObject from "../assets/data/content_similarities_object.json";

/* Make recommendation using previously calculated content similarities between
routes.*/
export default function (preferences, initialRoutesArray) {
  return initialRoutesArray.map((route2) => {
    // return the given preference when route2 is included in preferences
    if (route2.route in preferences) {
      console.log(route2.route);
      console.log(preferences[route2.route]);
      return { ...route2, contentPrediction: preferences[route2.route] };
    }

    // there are two possible keys to consider
    const key1 = (route1) => route1 + " " + route2.route;
    const key2 = (route1) => route2.route + " " + route1;
    const keys = [key1, key2];
    let len = 0;
    let sum = 0;
    let max = 0;

    // only looking at four star preferences
    for (const route1 in preferences) {
      for (const key of keys) {
        if (key(route1) in simObject && preferences[route1] === 4) {
          const score = 4 * simObject[key(route1)];
          len++;
          sum += score;
          max = Math.max(max, score);
        }
      }
    }

    // let prediction = len ? sum / len : 0; // avoiding dividing by 0
    let prediction = max;
    prediction = Math.min(prediction, 4); // clipping
    prediction = Math.max(prediction, 0); // clipping
    return { ...route2, contentPrediction: prediction };
  });
}
