import React, {useEffect, useState } from "react";
//import { items } from "../tools/datosItems";
import AcordeonItem  from "./AcordeonItem";

const Acordeon = ( {esconde, items, ActualizaGraf}) => {
  const [clicked, setClicked] = useState("0");
  useEffect(() => {
    console.log(`entro useEffect en acordeon, ${esconde}`);
    setClicked("0");
  }, [esconde]);
  const handleToggle = (indice) => {
    if ( clicked === indice) {
      setClicked("0");
      return;
    }
    ActualizaGraf(indice);      
    setClicked(indice);
  };

  return (
    <ul className={`acordeon ${esconde ? "esconde" : ""}`}>
      {items.map((item, indice) => (
        <AcordeonItem
          onToggle={() => handleToggle(indice)}
          activo= {clicked === indice}
          key={indice}
          item={item}
        /> 
      ))}
    </ul>
  );
};

export default Acordeon;