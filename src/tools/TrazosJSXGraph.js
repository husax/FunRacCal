const GraficaNueva = (brd, param) => {
  brd.suspendUpdate();
  BorraObjGraficos(brd, param);
  let fun1 = brd.create("functiongraph", [param.func], {
    strokewidth: 2,
    name: "f",
    strokecolor: "green",
  });
  param.funcAnt = fun1.id;
  brd.unsuspendUpdate();
};

const EliminaMultiples= (arr) => {
  let rzant=null;
  const result= [];
  arr.forEach((elem) => {
    if (elem !== rzant) {
      result.push(elem);
    }
    rzant= elem;
  });
  return result;
}

const YaTrazadas= (r,p) => {
  const pant=p.raicesPtos;
  const rcoor=pant.map((valor) => valor.coords.usrCoords[1] );
  if (rcoor.length === 0) {
    return false;
  }
  for (let i = 0; i < rcoor.length; i++) {
    if (r[i] !== rcoor[i]) {
      return false;
    }
  }
  return true;
}

const GraficaRaices = (brd, param) => {
  const raices= EliminaMultiples(param.raices);
  if (YaTrazadas(raices, param)) {
    return;
  }
  brd.suspendUpdate();
  const ptos=raices.map((raiz, ind) => {
    return brd.create('point', [raiz , param.func(raiz)], { name: `r${ind+1}` , face: 'x', fixed: true});
  });
  param.raicesPtos= ptos;
  brd.unsuspendUpdate();
}

const BorraObjGraficos = (brd, param) => {
  brd.suspendUpdate();
  if (param.funcAnt !== "") {
    brd.removeObject(param.funcAnt, false);
  }
  param.raicesPtos.forEach(pto => {
    brd.removeObject(pto.id, false);
  });
  brd.unsuspendUpdate();
}

const AgregaGrafica = (brd, param) => {
  brd.suspendUpdate();
  let fun1 = brd.create("functiongraph", [param.func], {
    strokewidth: 2,
    name: "f'",
    strokecolor: "red",
  });
  param.funcDer = fun1.id;
  brd.unsuspendUpdate();
}


export {GraficaNueva, GraficaRaices, AgregaGrafica}
