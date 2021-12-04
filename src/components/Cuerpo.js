import React from 'react';

// comppnentes
import CajaMath from './CajaMath';
import JXGBoard from './Jsxboard-react';
import MsgModal from './MsgModal';


// captura y procesamiento de objetos matemáticos
import TeXToLinealPyt from "../tools/TeXToLineal";
import InfijaAPolaca from "../tools/InfAPolInvCls";
import {ArrNum, ArrNumToString, cadBul, calcExtremos}  from "../tools/ConvierteData";
import { GraficaNueva, GraficaRaices } from '../tools/TrazosJSXGraph';
import $ from "jquery";

// componentes bootstrap
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";
import Acordeon from './Acordeon';

// variables de trabajo
let funRac= null;
InfijaAPolaca.IniciaErrores();
/*
const  creaFun= (lat) => {
  let cad = TeXToLinealPyt.TexToPyt(lat, true);
  let creafun = `(function (x) { return ${cad}; })`;
  let F = eval(creafun);
  return F;
} */

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


//const DatoContexto = React.createContext("algo");

const elem=[
  {
    uuid: 'k0',
    textoBtn: 'Raices',
    contenido: '',
    expanded: false,
  },
  {
    uuid: 'k1',
    textoBtn: '1ª derivada',
    contenido: '',
    expanded: false,
  },
  {
    uuid: 'k2',
    textoBtn: '2ª derivada',
    contenido: '',
    expanded: false,
  }
];

class Cuerpo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latexFun: props.latexIni,
      calculoSympy: {},
      inicio: true,
      boardAttribs: props.boardAttribs,
      show: false,
      mensaje: "",
      grafica: props.grafica,
      param: props.param,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAc = this.handleChangeAc.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  //static contextType = DatoContexto;

  handleChange(latex) {
    this.setState({ latexFun: latex,
                    inicio: true    
    });
  }

  handleChangeAc(item) {
    console.log('si switchea');
    console.log(item);
    if (item[0] === 'k0' && this.state.calculoSympy.hasOwnProperty('rfun') ) {
      this.setState({
        inicio: false, 
        grafica: GraficaRaices,
        param: { func: (x) => funRac.Evalua(x),
          funcAnt: this.state.param.funcAnt, 
          raices: this.state.calculoSympy.rfun,
          raicesAnt: this.state.param.raicesAnt, 
        }
      });

    }
  }

  handleClick() {
    console.log(this.state.latexFun);
    let cadpyt = TeXToLinealPyt.TexToPyt(this.state.latexFun, true);
    let cad = TeXToLinealPyt.TexToPyt(this.state.latexFun, false);
    let cadFunRac;
    let ventanaY;
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
          data.racional= cadBul(data.racional);
          data.rfun= ArrNum(data.raices.rfun);
          data.rder1= ArrNum(data.raices.rder1);
          data.rder2= ArrNum(data.raices.rder2);
          if (data.racional) {
            data.remov= ArrNum(data.remov);  
          }
          data.ventanaX= ArrNum(data.ventanaX);
          console.log(data);
          this.setState({ calculoSympy: data });
          res(this.state.calculoSympy.ventanaX);
        },
        error: (xhr) => {
          console.log(`Ocurrio el error ${xhr.status} ${xhr.statusText}`);
        },
      });
    });
    miPromesa.then((arr) => {
      ventanaY= calcExtremos((x) => funRac.Evalua(x), this.state.calculoSympy.rder1); 
      this.setState({
        inicio: false,
        grafica: GraficaNueva,
        boardAttribs: {boundingbox: [arr[0], ventanaY[1]*1.1, arr[1], ventanaY[0]*1.1]}, 
        param: { func: (x) => funRac.Evalua(x),
                  funcAnt: this.state.param.funcAnt,
                  raicesAnt: this.state.param.raicesAnt,
                }  
      });
    });
  }

  handleClose() {
    this.setState({ show: false });
  }

  datosAcordeon(elem) {
    const copiaElem= elem.slice(0);
    if (this.state.calculoSympy.hasOwnProperty('rfun'))
      {
        copiaElem[0].contenido= ArrNumToString( this.state.calculoSympy.rfun, 3);
        copiaElem[0].expanded= true;
      }
    return copiaElem;
  }

  render() {
    //let dato=this.context;
    return (
      <Container fluid>
        <MsgModal
              show={this.state.show}
              mensaje={this.state.mensaje}
              onClose={this.handleClose}
        />
        <Row>
          <Col sm={3}>
            <CajaMath
              latex={this.state.latexFun}
              onClick={this.handleClick}
              onChange={this.handleChange}
            />
            <Acordeon esconde={this.state.inicio} items={this.datosAcordeon(elem)} onChange={this.handleChangeAc }/>
          </Col>
          <Col sm={{ order: "last" }}>
            <JXGBoard
              logic={this.state.grafica}
              boardAttributes={this.state.boardAttribs}
              param={this.state.param}
              style={{
                width: "maxContent",
                height: "45em",
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


//export {DatoContexto};
export default Cuerpo;
