import React from 'react';

// comppnentes
import CajaMath from './CajaMath';
import JXGBoard from './Jsxboard-react';

// captura y procesamiento de objetos matemáticos
import TeXToLinealPyt from "../tools/TeXToLineal";
import InfijaAPolaca from "../tools/InfAPolInvCls";
import {ArrNum}  from "../tools/ConvierteData";
import $ from "jquery";

// componentes bootstrap
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";

// variables de trabajo
let funid = "";
let funRac= null;

const  creaFun= (lat) => {
  let cad = TeXToLinealPyt.TexToPyt(lat, true);
  let creafun = `(function (x) { return ${cad}; })`;
  let F = eval(creafun);
  return F;
}

const ChecaHuecos= (cad) => {
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

const Grafica = (brd, param) => {
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
    let miPromesa= new Promise((res, rej) => {
      $.ajax({
        type: "GET",
        url: "http://127.0.0.1:5000/api/v1/polynomial/properties/" + cadFunRac,
        success: (data) => {
          console.log(data);
          this.setState({ calculoSympy: data });
          res(ArrNum(this.state.calculoSympy.ventanaX));
        },
        error: (xhr) => {
          console.log(`Ocurrio el error ${xhr.status} ${xhr.statusText}`);
        },
      });
    });
    miPromesa.then((arr) => {
      this.setState({ funjs: (x) => funRac.Evalua(x) });
      this.setState({boardAttibs: {boundingbox: [arr[0], 100, arr[1], -100]}});
    });
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

export default Cuerpo;
