import React, { useEffect, useState } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import { getRecommendations } from "../algorithm";
import Redirect from "react-router-dom/Redirect";

export default (props) => {
  return (
    <>
      <Button
        variant="primary"
        disabled={props.submitButtonClicked && props.allowSubmit}
        onClick={
          !props.submitButtonClicked
            ? () => {
                props.setSubmitButtonClicked(true);
              }
            : null
        }
      >
        {props.allowSubmit && props.submitButtonClicked ? (
          <LoadingButtonText
            allowSubmit={props.allowSubmit}
            submitButtonClicked={props.submitButtonClicked}
            ratingsObject={props.ratingsObject}
            setRecommendations={props.setRecommendations}
          />
        ) : (
          "Get Recommendations"
        )}
      </Button>
      {!props.allowSubmit && props.submitButtonClicked && (
        <Alert variant="warning" style={{ marginTop: 50 }}>
          You must complete preferences for {props.minRequired} distinct routes
          to continue. So far you have only completed preferences for{" "}
          {Object.keys(props.ratingsObject).length} distinct routes.
        </Alert>
      )}
    </>
  );
};

const LoadingButtonText = (props) => {
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    // Timeout guarantees "Calculating..." will render before recommendations calculated
    setTimeout(
      () => setRecommendations(getRecommendations(props.ratingsObject)),
      50
    );
  }, [props.ratingsObject]);

  return (
    <>
      <div>Calculating...</div>
      <Spinner animation="border" variant="info" />
      {recommendations !== null && (
        <Redirect
          push
          to={{
            pathname: "/recommendation",
            recommendations: recommendations,
          }}
        />
      )}
    </>
  );
};
