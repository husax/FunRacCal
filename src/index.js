import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { addStyles, EditableMathField } from "react-mathquill";
import $ from "jquery";
import JXGBoard from "jsxgraph-react-js";
//import Alert from "react-bootstrap/Alert";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/Navdropdown";
import Image from "react-bootstrap/Image";
import InputGroup from "react-bootstrap/InputGroup";

import "bootstrap/dist/css/bootstrap.min.css";
import TeXToLinealPyt from "./TeXToLineal";

addStyles();

let funid = "";

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

class Cabeza extends React.Component {
  render() {
    return (
      <Container fluid>
        <Row bg="light">
          <Col className="align-self-center cinves-color bg-light font-italic">
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

class CajaMath extends React.Component {
  render() {
    return (
      <InputGroup size="lg" className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="basic-addon1">P(x) =</InputGroup.Text>
        </InputGroup.Prepend>
        <EditableMathField // este se importó de mathQuill
          latex={this.props.latex}
          config={{
            charsThatBreakOutOfSupSub: "+-()",
            autoCommands: "pi sqrt",
          }}
          onChange={(mathField) => {
            let latex = mathField.latex();
            this.props.onChange(latex);
          }}
          onKeyDown={(event) => filtro(event)}
        />
        <InputGroup.Append>
          <Button
            variant="success"
            size="lg"
            block
            onClick={this.props.onClick}
          >
            Obtener Propiedades
          </Button>
        </InputGroup.Append>
      </InputGroup>
    );
  }
}

function creaFun(lat) {
  let cad = TeXToLinealPyt.TexToPyt(lat);
  let creafun = `(function (x) { return ${cad}; })`;
  let F = eval(creafun);
  return F;
}

class Cuerpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latexFun: props.latexIni,
      calculoSympy: {},
      funjs: creaFun(props.latexIni),
    };
    this.handleClick = this.handleClick.bind(this);
    //this.handleParam = this.handleParam.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(latex) {
    this.setState({ latexFun: latex });
  }

  handleClick() {
    let cad = TeXToLinealPyt.TexToPyt(this.state.latexFun);
    console.log(cad);
    $.ajax({
      type: "GET",
      url: "http://127.0.0.1:5000/api/v1/polynomial/properties/" + cad,
      success: (data) => {
        console.log(data);
        this.setState({ calculoSympy: data });
      },
    });
    this.setState({ funjs: creaFun(this.state.latexFun) });
  }

  //handleParam(f) {
  //  return { func: f };
  //}

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
          </Col>
          <Col sm={{ order: "last" }}>
            <JXGBoard
              logic={Grafica}
              boardAttributes={{
                axis: true,
                boundingbox: [-10, 10, 10, -10],
              }}
              param={{ func: this.state.funjs }}
              style={{
                width: "maxContent",
                height: "50em",
                border: "3px solid green",
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
        <Cuerpo latexIni="\frac{x^3-3x+1}{x^2-4}" />
      </div>
    );
  }
}

ReactDOM.render(<Pagina />, document.getElementById("root"));
