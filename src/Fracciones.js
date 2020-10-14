class Fraccion {
  constructor(num = 0, den = 1) {
    if (Number.isInteger(num) && Number.isInteger(den)) {
      this.n = Math.abs(num);
      this.d = Math.abs(den);
      if (num * den < 0) {
        this.n *= -1;
      }
    } else {
      this.n = 0;
      this.d = 0;
    }
  }
  static mcd(a, b) {
    let c = a % b;
    while (c !== 0) {
      a = b;
      b = c;
      c = a % b;
    }
    return b;
  }
  static mcm(a, b) {
    return (a * b) / Fraccion.mcd(a, b);
  }

  get isPositiv() {
    return this.n > 0;
  }
  get isFraccion() {
    return this.d !== 0;
  }
  get isEntero() {
    return this.d === 1;
  }

  get isCero() {
    return this.n === 0;
  }

  copia() {
    return new Fraccion(this.n, this.d);
  }
  suma(q) {
    let minComMul = Fraccion.mcm(this.d, q.d);
    return new Fraccion(
      (minComMul / this.d) * this.n + (minComMul / q.d) * q.n,
      minComMul
    );
  }
  invAd() {
    return new Fraccion(-this.n, this.d);
  }
  resta(q) {
    return this.suma(q.invAd());
  }
  reduce() {
    if (this.isFraccion) {
      let maxcomdiv = Fraccion.mcd(Math.abs(this.n), this.d);
      return new Fraccion(this.n / maxcomdiv, this.d / maxcomdiv);
    } else {
      return new Fraccion(1, 0); // se mantiene como no fracción
    }
  }
  producto(q) {
    if (
      this.n * q.n < Number.MAX_SAFE_INTEGER &&
      this.d * q.d < Number.MAX_SAFE_INTEGER
    ) {
      return new Fraccion(this.n * q.n, this.d * q.d);
    } else {
      let fac1 = this.reduce();
      let fac2 = q.reduce();
      if (
        fac1.n * fac2.n < Number.MAX_SAFE_INTEGER &&
        fac1.d * fac2.d < Number.MAX_SAFE_INTEGER
      ) {
        return new Fraccion(fac1.n * fac2.n, fac1.d * fac2.d);
      } else {
        let fac3 = new Fraccion(fac1.n, fac2.d).reduce();
        let fac4 = new Fraccion(fac2.n, fac1.d).reduce();
        if (
          fac3.n * fac4.n < Number.MAX_SAFE_INTEGER &&
          fac3.d * fac4.d < Number.MAX_SAFE_INTEGER
        ) {
          return new Fraccion(fac3.n * fac4.n, fac3.d * fac4.d);
        }
      }
    }
  }
  reciproco() {
    return new Fraccion(this.d, this.n);
  }
  cociente(q) {
    return this.producto(q.reciproco());
  }
  potencia(n) {
    let prod = this.copia();
    for (let i = 1; i < n; i++) {
      prod = this.producto(prod);
    }
    return prod;
  }
  isIgual(q) {
    return this.reduce().n === q.reduce().n && this.reduce().d === q.reduce().d;
  }
  toString() {
    return this.n.toString() + "/" + this.d.toString();
  }
}

////////////////////

class Lineal extends Fraccion {
  // recibe un termino de x
  constructor(cx = new Fraccion(1), ti = new Fraccion(0)) {
    super(ti.n, ti.d);
    this.cx = cx;
    // this.ti = ti;
    this.lineal = true;
  }

  get isLineal() {
    return this.lineal;
  }

  get ti() {
    return new Fraccion(this.n, this.d);
  }

  get isFraccion() {
    return this.cx.n === 0;
  }

  suma(q) {
    return new Lineal(this.cx.suma(q.cx), this.ti.suma(q.ti));
  }
  multiesc(a) {
    return new Lineal(
      this.cx.producto(a).reduce(),
      this.ti.producto(a).reduce()
    );
  }

  resta(q) {
    return new Lineal(this.cx.resta(q.cx), this.ti.resta(q.ti));
  }
  isMultiplo(q) {
    if (this.cx.n === 0 && q.cx.n === 0) {
      return true;
    } else if (this.cx.n * q.cx.n === 0) {
      return false;
    }
    let tip = this.ti.cociente(this.cx);
    let tiq = q.ti.cociente(q.cx);
    return tip.isIgual(tiq);
  }
}

class Decimal extends Fraccion {
  constructor(dec) {
    if (typeof dec.valueOf() === "string" && dec !== "") {
      let { num: n, den: d } = Decimal.convierteAFrac(dec);
      super(n, d);
      this.dec = dec;
    } else {
      super(0, 0);
      this.dec = "";
    }
  }

  static convierteAFrac(decCad) {
    let partes = decCad.split(".");
    let ncad = partes[0] + partes[1];
    let d = 1;
    for (let i = 0; i < partes[1].length; i++) {
      d *= 10;
    }
    return { num: Number.parseInt(ncad), den: d };
  }

  get isDecimal() {
    return this.dec !== "";
  }

  suma(d) {
    if (d.isDecimal) {
      let frac = super.suma(d);
      let dec = (frac.n / frac.d).toString();
      return new Decimal(dec);
    }
    return super.suma(d);
  }

  invAd() {
    let cad = this.dec[0] === "-" ? this.dec.slice(1) : "-" + this.dec;
    return new Decimal(cad);
  }

  resta(d) {
    return this.suma(d.invAd());
  }

  producto(d) {
    if (d.isDecimal) {
      let frac = super.producto(d);
      let dec = (frac.n / frac.d).toString();
      return new Decimal(dec);
    }
    return super.producto(d);
  }

  cociente(d) {
    if (d.isDecimal) {
      let frac = super.cociente(d);
      let dec = (frac.n / frac.d).toFixed(6); // esto es arbitrario
      return new Decimal(dec);
    }
    return super.cociente(d);
  }
}

export { Fraccion, Lineal, Decimal };
