/* Determine routes in common to user1 and user2. */
const getIntersection = (user1, user2) => {
  return Object.keys(user1).filter({}.hasOwnProperty.bind(user2));
};

/* Calculates the cosine of the angle between user1[keys] and user2[keys]. */
const getAngle = (user1, user2, keys) => {
  const dot = getDot(user1, user2, keys);
  const norm1 = getDot(user1, user1, keys);
  const norm2 = getDot(user2, user2, keys);
  return dot / Math.pow(norm1 * norm2, 0.5);
};

/* Calculates the dot product of user1[keys] and user2[keys]. */
const getDot = (user1, user2, keys) => {
  const products = keys.map((key) => user1[key] * user2[key]);
  return products.reduce((a, b) => a + b, 0);
};
