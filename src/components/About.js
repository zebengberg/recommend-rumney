import React from "react";
import Container from "react-bootstrap/Container";
import ReactMarkdown from "react-markdown";
import raw from "raw.macro";

export default () => (
  <Container>
    <ReactMarkdown source={raw("../README.md")} />
  </Container>
);
