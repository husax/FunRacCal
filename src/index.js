import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { addStyles, EditableMathField } from "react-mathquill";
import $ from "jquery";
import JXGBoard from './jsxboard-react';

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/Navdropdown";
import Image from "react-bootstrap/Image";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import TeXToLinealPyt from "./TeXToLineal";
import InfijaAPolaca from "./InfAPolInvCls";

addStyles();

let funid = "";
let funRac;

//let infpol = new InFijaAPolaca("2+3*4");
//let error = infpol.InfAPol();
//console.log(infpol.postFija);

function filtro(e) {
  const teclasEsp = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Delete",
    "Enter",
    "Insert",
    "Backspace",
    "Home",
    "End",
  ];
  const caracAcep = "0123456789x+-/*()=.sqrt";
  if (teclasEsp.indexOf(e.key) !== -1 || caracAcep.indexOf(e.key) !== -1) {
    return;
  }
  // impide que se realice la acción por defecto del evento
  e.preventDefault();
}

class BarraNav extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">Funciones Algebraicas:</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto text-light">
            <Nav.Link href="#home">Inicio</Nav.Link>
            <NavDropdown title="Funciones" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">
                Polinomiales
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Racionales</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Radicales</NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

function Cabeza() {
  return (
    <Container fluid>
      <Row className="bg-light">
        <Col className="align-self-center cinves-color font-italic">
          <h2>CalcVisual Web</h2>
        </Col>
        <Col md={{ span: 4, offset: 4 }}>
          <Image src="./logo.jpg" />
        </Col>
      </Row>
      <Row>
        <Col>
          <BarraNav />
        </Col>
      </Row>
    </Container>
  );
}

let Grafica = (brd, param) => {
  if (funid !== "") {
    brd.removeObject(funid, false);
  }
  let fun1 = brd.create("functiongraph", [param.func], {
    strokewidth: 2,
    name: "f",
    strokecolor: "green",
  });
  funid = fun1.id;
};

//class CajaMath extends React.Component {
//  render() {
function CajaMath(props) {
  return (
    <InputGroup size="lg" className="mb-3">
      <InputGroup.Prepend>
        <InputGroup.Text id="basic-addon1">P(x) =</InputGroup.Text>
      </InputGroup.Prepend>
      <EditableMathField // este se importó de mathQuill
        latex={props.latex}
        config={{
          charsThatBreakOutOfSupSub: "+-()",
          autoCommands: "pi sqrt",
        }}
        onChange={(mathField) => {
          props.onChange(mathField.latex());
        }}
        onKeyDown={(event) => filtro(event)}
      />
      <InputGroup.Append>
        <Button variant="success" size="lg" block onClick={props.onClick}>
          Obtener Propiedades
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
}

function creaFun(lat) {
  let cad = TeXToLinealPyt.TexToPyt(lat, true);
  let creafun = `(function (x) { return ${cad}; })`;
  let F = eval(creafun);
  return F;
}

function ChecaHuecos(cad) {
  let reg = /\*\*\(\)/g;
  if (cad.match(reg) !== null) {
    return "Hay una casilla de exponente vacia";
  }
  reg = /\/\(\)/;
  if (cad.match(reg) !== null) {
    return "Hay un cociente indicado pero falta el denominador";
  }
  reg = /\(\)\//;
  if (cad.match(reg) !== null) {
    return "Hay un cociente indicado pero falta el numerador";
  }
  return "";
}

class Cuerpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latexFun: props.latexIni,
      calculoSympy: {},
      funjs: creaFun(props.latexIni),
      boardAttibs: props.boardAttibs,
      show: false,
      mensaje: "",
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange(latex) {
    this.setState({ latexFun: latex });
  }

  handleClick() {
    console.log(this.state.latexFun);
    let cadpyt = TeXToLinealPyt.TexToPyt(this.state.latexFun, true);
    let cad = TeXToLinealPyt.TexToPyt(this.state.latexFun, false);
    let cadFunRac;
    //console.log(cadpyt);
    let msg = ChecaHuecos(cadpyt);
    if (msg !== "") {
      this.setState({
        show: true,
        mensaje: msg,
      });
      return;
    }
    let procesaInfija = new InfijaAPolaca(cad);
    procesaInfija.InfAPol();
    if (procesaInfija.numError !== 0) {
      this.setState({
        show: true,
        mensaje: InfijaAPolaca.errores[-procesaInfija.numError],
      });
      return;
    }
    funRac = procesaInfija.EvalFuncRac(procesaInfija.postFija);
    if (funRac.esPolinomio) {
      cadFunRac = funRac.toString();
    } else {
      cadFunRac = funRac.numP.toString() + "," + funRac.denomP.toString();
    }
    $.ajax({
      type: "GET",
      url: "http://127.0.0.1:5000/api/v1/polynomial/properties/" + cadFunRac, // cadpyt,
      success: (data) => {
        console.log(data);
        this.setState({ calculoSympy: data });
      },
    });

    this.setState({ funjs: (x) => funRac.Evalua(x) });
    this.setState({boardAttibs: {boundingbox: [-10, 100, 10, -100]}});
  }

  handleClose() {
    this.setState({ show: false });
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col sm={4}>
            <CajaMath
              latex={this.state.latexFun}
              onClick={this.handleClick}
              onChange={this.handleChange}
            />
            <Modal
              show={this.state.show}
              onHide={this.handleClose}
              backdrop="static"
              animation={true}
            >
              <Modal.Header className="bg-danger" closeButton>
                <Modal.Title>Expresión errónea </Modal.Title>
              </Modal.Header>
              <Modal.Body>{this.state.mensaje}</Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={this.handleClose}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
          </Col>
          <Col sm={{ order: "last" }}>
            <JXGBoard
              logic={Grafica}
              boardAttributes={ this.state.boardAttibs}
              param={{ func: this.state.funjs }}
              style={{
                width: "maxContent",
                height: "50em",
                border: "3px solid green",
                borderRadius: "8px",
              }}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

class Pagina extends React.Component {
  render() {
    return (
      <div>
        <Cabeza />
        <Cuerpo latexIni="\frac{x^3-3x+1}{x^2-4}" 
            boardAttibs={{
                axis: true,
                boundingbox: [-10, 10, 10, -10],
            }} />
      </div>
    );
  }
}

ReactDOM.render(<Pagina />, document.getElementById("root"));
