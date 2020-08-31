import React from "react";
import StarRatingComponent from "react-star-rating-component";

export default (props) => {
  return (
    <>
      Rate it.
      <StarRatingComponent
        style={{ position: "absolute" }}
        starColor="gold"
        emptyStarColor="lightgray"
        name={"to be given route name"}
        starCount={4}
        value={props.rating}
        onStarClick={(nextValue) => props.setRating(nextValue)}
        // renderStarIcon={(index, value) => {
        //   return <span>☆</span>;
        // }}
      />
    </>
  );
};
