import React from 'react';
import { addStyles, EditableMathField } from "react-mathquill";
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

export default CajaMath;
