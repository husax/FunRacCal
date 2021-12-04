import React from 'react';
import { addStyles, EditableMathField, StaticMathField } from "react-mathquill";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

addStyles();

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

const CajaMath=  (props) => {
  return (
    <InputGroup size="lg" className="mb-3">
      <InputGroup.Text id="basic-addon1">P(x) =</InputGroup.Text>
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
        <Button variant="success" size="lg" onClick={props.onClick}>
          Aceptar
        </Button>
    </InputGroup>
  );
}

const CajaMathFija = (props) => {
  return ( <StaticMathField>{props.latex}</StaticMathField> );
}

export default CajaMath;
export { CajaMathFija }
