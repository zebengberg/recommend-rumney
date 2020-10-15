import slopeOneObject from "../assets/data/slope_one_object.json";

/* Make recommendation using previously calculated slope one parameters. */
export default function (preferences, initialRoutesArray) {
  return initialRoutesArray.map((route2) => {
    const key = (route1) => route1 + " " + route2.route; // helper function
    let route1Array = Object.entries(preferences).filter(
      ([route1]) => key(route1) in slopeOneObject
    );

    route1Array = route1Array.map(
      ([route1, rating]) => rating - slopeOneObject[key(route1)]
    );

    // averaging over all route1
    const l = route1Array.length;
    const s = route1Array.reduce((sum, cur) => sum + cur, 0);
    // could give small bonus to more popular route2 here
    let prediction = l ? s / l : 0; // avoiding dividing by 0
    prediction = Math.min(prediction, 4); // clipping
    prediction = Math.max(prediction, 0); // clipping
    return { ...route2, slopeOnePrediction: prediction };
  });
}
