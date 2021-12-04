import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import {CajaMathFija} from './CajaMath';

const CajaDeriv= ({latex, grafDer}) => {
return (
          
    <div className="cajaAc">
      <span>P'(x) = </span>
      <CajaMathFija latex={latex}> </CajaMathFija>
      <ListGroup horizontal>
        <ListGroupItem>
          <input type="checkbox" name="grafica" onClick={grafDer} />
          <label htmlFor="grafica">Ver gráfica</label>
        </ListGroupItem>
        <ListGroupItem>
          <input type="checkbox" name="tangente" />
          <label htmlFor="tangente">Ver tangentes</label>
        </ListGroupItem>
      </ListGroup>
    </div>
)}
export default CajaDeriv;