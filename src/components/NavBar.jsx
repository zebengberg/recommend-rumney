import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import logo from "../assets/img/logo.png";

export default () => (
  <Navbar bg="light">
    <Navbar.Brand href="#">
      <img
        src={logo}
        width="30"
        height="30"
        className="d-inline-block align-top"
        alt="home"
      />
    </Navbar.Brand>
    <Nav className="mr-auto">
      <Nav.Link href="#/network">network</Nav.Link>
      <Nav.Link href="https://github.com/zebengberg/recommend-rumney/blob/master/README.md">
        about
      </Nav.Link>
    </Nav>
  </Navbar>
);
