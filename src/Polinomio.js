function ACadenaSinCeros(n, dig) {
    let d = Math.floor(dig);
    if (Number.isInteger(n)) {
        return n.toString();
    }
    let cad = n.toFixed(d);
    while (cad[cad.length - 1] === "0") {
        cad = cad.slice(0, cad.length - 1);
    }
    if (cad[cad.length - 1] === ".") {
        cad = cad.slice(0, cad.length - 1);
    }
    return cad;
}
class Polinomio {
    constructor(arr, v = "x") {
        this._var = v;
        this._raices = [];
        let gr = arr.length - 1;
        while (arr[gr] === 0) {
            gr--;
        }
        if (gr < 0) {
            this.coefs = [0];
        }
        else {
            this.coefs = arr.slice(0, ++gr);
        }
    }
    // propiedades no modificables
    get grado() {
        return this.coefs.length - 1;
    }
    get variable() {
        return this._var;
    }
    set variable(v) {
        this._var = v;
    }
    get esMonico() {
        return this.coefs[this.grado] === 1 ? true : false;
    }
    get esPolinomio() {
        return true;
    }
    get esConstante() {
        return this.grado === 0;
    }
    // metodo estatico para construir un polinomio con un solo dato
    // crea un polinomio con un único término
    // el monomio ai*x^ind
    static Monomio(ai, ind, v = "x") {
        let pot = Math.floor(ind);
        let mon = new Array(pot + 1);
        mon.fill(0);
        mon[pot] = ai;
        return new Polinomio(mon, v);
    }
    // suma del polinomio que llama con otro polinomio q
    Suma(q) {
        if (this.grado >= q.grado) {
            let s = this.coefs.slice(0);
            for (let i = 0; i < q.coefs.length; i++) {
                s[i] += q.coefs[i];
            }
            return new Polinomio(s, this.variable);
        }
        else {
            let s = q.coefs.slice(0);
            for (let i = 0; i < this.coefs.length; i++) {
                s[i] += this.coefs[i];
            }
            return new Polinomio(s, this.variable);
        }
    }
    Producto(q) {
        let s = new Array(this.grado + q.grado + 1);
        s.fill(0);
        for (let i = 0; i <= this.grado; i++) {
            for (let j = 0; j <= q.grado; j++) {
                s[i + j] += this.coefs[i] * q.coefs[j];
            }
        }
        return new Polinomio(s, this.variable);
    }
    ProductoPorN(n) {
        let s = this.coefs.slice(0);
        for (let i = 0; i < s.length; i++) {
            s[i] *= n;
        }
        return new Polinomio(s, this.variable);
    }
    InversoAd() {
        let s = this.coefs.slice(0);
        for (let i = 0; i < s.length; i++) {
            s[i] *= -1;
        }
        return new Polinomio(s, this.variable);
    }
    Resta(q) {
        return this.Suma(q.InversoAd());
    }
    Copia() {
        return new Polinomio(this.coefs, this.variable);
    }
    Potencia(n) {
        let s = this.Copia();
        if (Number.isInteger(n)) {
            for (let i = 1; i < n; i++) {
                s = s.Producto(this);
            }
            return s;
        }
        else {
            return s;
        }
    }
    Cociente(q) {
        if (this.grado < q.grado) {
            return new Polinomio([0], this.variable);
        }
        else {
            let r = this.Copia();
            let grs = r.grado - q.grado;
            let coc = Polinomio.Monomio(r.coefs[r.grado] / q.coefs[q.grado], grs, r.variable);
            r = r.Resta(coc.Producto(q));
            return coc.Suma(r.Cociente(q));
        }
    }
    Residuo(q) {
        if (this.grado < q.grado) {
            return this.Copia(); // en este caso el residuo es el dividendo
        }
        else {
            let r = this.Copia();
            let grs = r.grado - q.grado;
            let cm = Polinomio.Monomio(r.coefs[r.grado] / q.coefs[q.grado], grs);
            r = r.Resta(cm.Producto(q));
            return r.Residuo(q);
        }
    }
    Evalua(x) {
        let pdeX = 0;
        for (let i = this.grado; i >= 0; i--) {
            pdeX = pdeX * x + this.coefs[i];
        }
        return pdeX;
    }
    toString() {
        let cad = "";
        let signo = "";
        let c;
        for (let i = this.grado; i >= 0; i--) {
            c = this.coefs[i];
            if (c !== 0) {
                signo = c > 0 ? "+" : "-";
                c = Math.abs(c);
                cad += signo;
                if (i === 0) {
                    cad += ACadenaSinCeros(c, 4);
                }
                else {
                    cad += c === 1 ? this.variable : ACadenaSinCeros(c, 5) + "*" + this.variable;
                    cad += i > 1 ? "**" + i.toString() : "";
                }
            }
        }
        if (cad === "") {
            cad = "0";
        }
        else if (cad[0] === "+") {
            cad = cad.slice(1);
        }
        return cad;
    }
    Derivada() {
        let dif = [];
        for (let i = 0; i < this.grado; i++) {
            dif[i] = (i + 1) * this.coefs[i + 1];
        }
        return new Polinomio(dif, this.variable);
    }
}
class FunRacional extends Polinomio {
    constructor(nP, dP = Polinomio.Monomio(1, 0)) {
        super(nP.coefs, nP.variable);
        this.denomP = dP.Copia();
        this.denomP.variable = this.variable;
    }
    get numP() {
        return super.Copia();
    }
    get esPolinomio() {
        return this.denomP.esConstante && this.denomP.esMonico;
    }
    Suma(r) {
        let denc = this.denomP.Producto(r.denomP);
        let num = this.numP.Producto(r.denomP);
        return new FunRacional(num.Suma(r.numP.Producto(this.denomP)), denc);
    }
    Producto(r) {
        return new FunRacional(this.numP.Producto(r.numP), this.denomP.Producto(r.denomP));
    }
    ProductoPorN(n) {
        return new FunRacional(this.numP.ProductoPorN(n), this.denomP);
    }
    Cociente(r) {
        return new FunRacional(this.numP.Producto(r.denomP), this.denomP.Producto(r.numP));
    }
    Potencia(n) {
        return new FunRacional(this.numP.Potencia(n), this.denomP.Potencia(n));
    }
    Evalua(x) {
        //let num= this.numP.Evalua(x);
        //let denom= this.denomP.Evalua(x);
        //if (num === 0 && denom === 0) {
        //  let numP= this.numP.Cociente(new Polinomio([num, 1]));
        //  let denomP= this.denomP.Cociente(new Polinomio([denom, 1]));
        //  return new FunRacional(numP, denomP).Evalua(x);
        //}
        return this.numP.Evalua(x) / this.denomP.Evalua(x);
    }
    toString() {
        if (this.esPolinomio) {
            return this.numP.toString();
        }
        return this.numP.toString() + "/" + this.denomP.toString();
    }
}
export { ACadenaSinCeros, FunRacional };
export default Polinomio;
