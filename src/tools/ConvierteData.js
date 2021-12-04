/// convierte una cadena que representa un arreglo de números 
/// a un arreglo de numeros 
function ArrNum(cad) {
    const len = cad.length;
    if (len === 0 || cad[0] !== '[' || cad[len - 1] !== ']' || cad === '[]') {
        return [];
    }
    const arreglo = cad.slice(1, len - 1).split(', ');
    return arreglo.map(x => Number.parseFloat(x));
}
//convierte cadena true a booleano
const cadBul = (cad) => cad.toLowerCase() === "true" ? true : false;
function calcExtremos(f, arr) {
    if (arr.length === 0)
        return [-10, 10];
    const farr = arr.map(x => f(x));
    const extr = [Math.min(...farr), Math.max(...farr)];
    extr[0] = extr[0] >= 0 ? -extr[1] * 1.1 : extr[0] * 1.1;
    extr[1] = extr[1] <= 0 ? -extr[0] * 1.1 : extr[1] * 1.1;
    return extr;
}
function ArrNumToString(arr, dig) {
    let cad = " ";
    for (let i = 0; i < arr.length; i++) {
        cad += `r${i + 1}= ${arr[i].toFixed(dig)}, `;
    }
    return cad.slice(0, cad.length - 2);
}
export { ArrNum, ArrNumToString, cadBul, calcExtremos };
