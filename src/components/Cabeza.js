import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import BarraNav from './BarraNav';
import logoImg from '../img/logo.jpg';

import "bootstrap/dist/css/bootstrap.min.css";

const Cabeza = () => {
  return (
    <Container fluid>
      <Row className="bg-light">
        <Col className="align-self-center cinves-color font-italic">
          <h2>CalcVisual Web</h2>
        </Col>
        <Col md={{ span: 4, offset: 4 }}>
          <Image src={logoImg} />
        </Col>
      </Row>
      <Row>
        <Col>
          <BarraNav />
        </Col>
      </Row>
    </Container>
  )
};

export default Cabeza;
