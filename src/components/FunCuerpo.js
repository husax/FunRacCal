import React, { useState } from 'react';

// componentes
import CajaMath from './CajaMath';
import JXGBoard from './Jsxboard-react';
import MsgModal from './MsgModal';
import Acordeon from './Acordeon';
import CajaDeriv from './CajaDeriv';
import { items } from "../tools/datosItems";
import "../app.css";


// captura y procesamiento de objetos matemáticos
import TeXToLinealPyt from "../tools/TeXToLineal";
import InfijaAPolaca from "../tools/InfAPolInvCls";
import {ArrNum, ArrNumToString, cadBul, calcExtremos}  from "../tools/ConvierteData";
import { GraficaNueva, GraficaRaices, AgregaGrafica} from '../tools/TrazosJSXGraph';
import $ from "jquery";

// componentes bootstrap
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";


// variables de trabajo
let funRac= null;
InfijaAPolaca.IniciaErrores();

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


const FunCuerpo = ({latex, graficaIni, paramIni, boardAttribsIni }) => {
  const [latexFun, setLatexFun] = useState(latex);
  const [msgModal, setMsgModal] = useState( {show: false, msg: ""});
  const [datosGraf, setDatosGraf] = useState({
    boardAttribs: boardAttribsIni,
    param: paramIni,
    grafica: graficaIni
  });
  const [inicio, setInicio] = useState(true);
  const [datosSympy, setDatosSympy] = useState({});

  const Acepta= () => {
    console.log(latexFun);
    let cadpyt = TeXToLinealPyt.TexToPyt(latexFun, true);
    let cad = TeXToLinealPyt.TexToPyt(latexFun, false);
    let cadFunRac;
    let ventanaY;
    let msg = ChecaHuecos(cadpyt);
    if (msg !== "") {
      setMsgModal({show: true, msg: msg});
      return;
    }
    let procesaInfija = new InfijaAPolaca(cad);
    procesaInfija.InfAPol();
    if (procesaInfija.numError !== 0) {
      setMsgModal({
        show: true,
        msg: InfijaAPolaca.errores[-procesaInfija.numError]
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
          console.log(data.derivada.latex);
          res(data);
        },
        error: (xhr) => {
          console.log(`Ocurrio el error ${xhr.status} ${xhr.statusText}`);
        },
      });
    });
    miPromesa.then((data) => {
      ventanaY= calcExtremos((x) => funRac.Evalua(x), data.rder1); 
      setInicio(false);
      setDatosGraf((prev) => ({
        boardAttribs: {
          axis: prev.boardAttribs.axis,
          boundingbox: [data.ventanaX[0], ventanaY[1]*1.1, data.ventanaX[1], ventanaY[0]*1.1]},
        param: {
          func: (x) => funRac.Evalua(x),
          funcAnt: prev.param.funcAnt,
          raices: [],
          raicesPtos: prev.param.raicesPtos, 
        },
        grafica: GraficaNueva,
      }));
      console.log(datosGraf);
      setDatosSympy(data);
      console.log(datosSympy);
    });

  }

  const ActualizaGraf= (item) => {
    console.log('si switchea');
    console.log(item);
    if (item === 0 && datosSympy.hasOwnProperty('rfun') ) {
      if (datosGraf.param.raices.length === 0) {
        setDatosGraf((prev) => ({
          boardAttribs: prev.boardAttribs,
          grafica: GraficaRaices,
          param: {
            func: (x) => funRac.Evalua(x),
            funcAnt: prev.param.funcAnt, 
            raices: datosSympy.rfun,
            raicesPtos: [], 
          }
        }));  
      }
      else {
        setDatosGraf((prev) => ({
          boardAttribs: prev.boardAttribs,
          grafica: GraficaRaices,
          param: {
            func: (x) => funRac.Evalua(x),
            funcAnt: prev.param.funcAnt, 
            raices: datosSympy.rfun,
            raicesPtos: prev.param.raicesPtos, 
          }
        }));
      }
    }
    else if (item === 1) {
      // setDatosGraf((prev) => ({
      //   boardAttribs: prev.boardAttribs,
      //   grafica: AgregaGrafica,
      //   param: {
      //     func: (x) => funRac.Derivada().Evalua(x),
      //     funcAnt: prev.param.funcAnt, 
      //     raices: datosSympy.rfun,
      //     raicesPtos: prev.param.raicesPtos, 
      //   }
      // }));
      
    }
  }

  const datosAcordeon = (elem) => {
    const copiaElem= elem.slice(0);
    if (datosSympy.hasOwnProperty('rfun')) {
        copiaElem[0].contenido= ArrNumToString( datosSympy.rfun, 3);
      }
    if (datosSympy.hasOwnProperty('derivada')) {
      copiaElem[1].contenido= <CajaDeriv latex={datosSympy.derivada.latex} 
                              grafDer={() =>
                              setDatosGraf((prev) => ({
        boardAttribs: prev.boardAttribs,
        grafica: AgregaGrafica,
        param: {
          func: (x) => funRac.Derivada().Evalua(x),
          funcAnt: prev.param.funcAnt, 
          raices: datosSympy.rfun,
          raicesPtos: prev.param.raicesPtos, 
        }
      })) } />
    }
    return copiaElem;
  } 

  return (
    <Container fluid>
      <MsgModal
            show={msgModal.show}
            msg={msgModal.msg}
            onClose={() => setMsgModal({show: false, msg: ""})}
      />
      <Row>
        <Col sm={3}>
          <CajaMath
            latex={latexFun}
            onClick={() => Acepta()}
            onChange={(latex) => { 
              setLatexFun(latex);
              setInicio(true);
            }}
          />
          <Acordeon esconde={inicio} items={datosAcordeon(items)} ActualizaGraf={ActualizaGraf}/>
        </Col>
        <Col sm={{ order: "last" }}>
          <JXGBoard
            logic={datosGraf.grafica}
            boardAttributes={datosGraf.boardAttribs}
            param={datosGraf.param}
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

export default FunCuerpo;