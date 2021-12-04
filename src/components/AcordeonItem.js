import React, { useRef } from "react";

const AcordeonItem = ({ item, activo, onToggle}) => {

  const { textoBtn, contenido} = item;
  const cajaContRef = useRef();
  return (
    <li className={`acordeon_item ${activo ? "activo" : ""}`}>
      <button className="acordeon_button" aria-expanded={activo ? 'true' : 'false'} onClick={onToggle}>
        {textoBtn}
      </button>
      <div
        ref={cajaContRef} 
        className="caja_contenido"
        style={
          activo
            ? { height: cajaContRef.current.scrollHeight }
            : { height: "0px" } 
        }
      >
        <span className="contenido" >
          {contenido}
        </span>
      </div>
    </li>
  );
}; 

export default AcordeonItem;