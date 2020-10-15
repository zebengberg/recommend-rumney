import contentSimilarity from "./contentSimilarity";
import user_array from "../assets/data/user_data_array.json";
import user_rating_object from "../assets/data/user_rating_object.json";
import route_array from "../assets/data/route_data_array.json";

export default function () {
  const index = Math.floor(Math.random() * user_array.length);
  const user = user_array[index];
  console.log(user);
  const preferences = user_rating_object[user.user];
  console.log(preferences);
  const results = contentSimilarity(preferences, route_array);
  console.log(results);
}
