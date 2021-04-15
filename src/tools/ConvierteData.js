/// convierte una cadena que representa un arreglo de números 
/// a un arreglo de numeros 
function ArrNum(cad) {
    const len = cad.length;
    if (len === 0 || cad[0] !== '[' || cad[len - 1] !== ']') {
        return [];
    }
    const arreglo = cad.slice(1, len - 1).split(', ');
    return arreglo.map((x) => Number.parseFloat(x));
}
export { ArrNum };
