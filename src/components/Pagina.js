import React from 'react';


//componentes
import Cabeza from './Cabeza';
import FunCuerpo from './FunCuerpo';

//herramientas
import {GraficaNueva} from '../tools/TrazosJSXGraph'

const Pagina = () => {
  return (
    <div>
      <Cabeza />
      <FunCuerpo latex="\frac{x^3-3x+1}{x^2-4}" 
        graficaIni={GraficaNueva}
        paramIni= {{
                func: (x) => (x**3-3*x+1)/(x**2-4),
                funcAnt:"",
                raices: [],
                raicesPtos: [],
        }}
        boardAttribsIni={{
              axis: true,
              boundingbox: [-10, 10, 10, -10],
        }}>
      </FunCuerpo>
    </div>
  );
}

export default Pagina;