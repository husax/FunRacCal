import React from 'react';

//componentes
import Cabeza from './Cabeza';
import Cuerpo from './Cuerpo';

const Pagina = () => {
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

export default Pagina;