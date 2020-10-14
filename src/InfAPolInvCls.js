import { Fraccion, Lineal, decimal } from "./Fracciones";
// const Cinves = { DME: {} };
class ParCadInt {
  constructor(c, j) {
    this._cad = c;
    this._jerar = j;
  }

  get cad() {
    return this._cad;
  }

  get jerar() {
    return this._jerar;
  }

  set jerar(j) {
    this._jerar = j;
  }
}

//Cinves.DME.InfijaAPolaca = class {
class InfijaAPolaca {
  constructor(infija) {
    // Lleva cuenta de los operadores y operandos binarios:
    // Si es un operando lo incrementa en 1.
    // si es un operador lo disminuye en 1.
    // El menos unario no lo modifica. Las funciones cuentan como operadores.
    this._balanceOp = 0;

    // LLeva cuenta de los pares de paréntesis:
    // Si es paréntesis izquierdo lo incrementa en 1.
    // si es paréntesis derecho lo decrementa en 1.
    //
    this._balancePar = 0;

    // sirve para distinguir el menos unario del binario
    this._hayPari = false;

    // define el orden de prioridad de los operadores y operandos. Uno para comparar
    // al entrar en la pila y otro para comparar al salir de la pila
    //                  '+'     '-'     '*'     '/'    '^'      '-'unario otros unarios
    this._jerarquia = [
      [1, 2],
      [1, 2],
      [3, 4],
      [3, 4],
      [6, 5],
      [8, 4],
      [8, 7],
      /*           */ [9, 10],
      [11, 0],
      [0, 0],
    ];
    //               var y num    '('    ')'

    // Stack de trabajo para la conversión a notación polaca
    // this._pilaTrab= new Array();

    // La cadena que se va a procesar
    this._infija = `(${infija})@`;

    // si se va a procesar otra cadena con la misma instancia
    // se hace true el booleano siguiente
    this._nuevaCad = false;

    // Caracter asociado al separador decimal, según el país
    this._sepDec = ".";

    // Posición del caracter a procesar.
    // Si hay error indica la posición del caracter con error.
    this._posicion = 0;

    // Después de procesar contiene la expresión en notación polaca.
    // cada entrada del arreglo es un operador u operando
    this._postFija = [];

    // Numero de error, si es que ocurre
    this._numError = 0;

    // enumeración para indicar que tipos de nombres de variables son aceptables
    this._tipoNomVar = {
      Letra: 0,
      LetrayDigitos: 1,
      Palabra: 2,
      PalabrayDigitos: 3,
    };

    // enumeración para identificar operandos y operadores
    this._tipoOper = {
      MasBin: 0,
      MenosBin: 1,
      Por: 2,
      Div: 3,
      Potencia: 4,
      MenosUnario: 5,
      FuncUnaria: 6,
      Variable: 7,
      Numero: 7,
      ParIzq: 8,
      ParDer: 9,
      MasUnario: 10, // no opera así que no le afecta la jerarquia
    };

    // tipo de nombres de variables aceptables vigente
    // puede ser: una letra, Letra; una letra y dígitos, LetrayDigitos;
    // una palabra, Palabra; una palabra y dígitos, PalabrayDigitos
    this._tipoNomVarVigente = this._tipoNomVar.Letra;

    // contiene una lista de variables y parámetros, no los distingue,
    // identificados al convertir la expresión.
    // almacena pares: nombre de variable y valor
    // de entrada contiene a PI y a e y sus valores correspondientes
    this._variables = {
      Pi: Math.PI,
      e: Math.E,
    };
  }

  static errores = [];

  get balancePar() {
    return this._balancePar;
  }

  get balanceOp() {
    return this._balanceOp;
  }

  set balanceOp(valor) {
    this._balanceOp = valor;
  }

  get hayPari() {
    return this._hayPari;
  }

  set hayPari(bo) {
    this._hayPari = bo;
  }

  get jerarquia() {
    return this._jerarquia;
  }

  get sepDec() {
    return this._sepDec;
  }

  set sepDec(cad) {
    this._sepDec = cad;
  }

  get infija() {
    return this._infija;
  }

  set infija(cad) {
    this._infija = `(${cad})@`;
    this._nuevaCad = true;
  }

  get postFija() {
    return this._postFija;
  }

  get numError() {
    return this._numError;
  }

  set numError(valor) {
    this._numError = valor;
  }

  get posicion() {
    return this._posicion;
  }

  get tipoOper() {
    return this._tipoOper;
  }
  get tipoNomVar() {
    return this._tipoNomVar;
  }

  get tipoNomVarVigente() {
    return this._tipoNomVarVigente;
  }

  set tipoNomVarVigente(tipoNomVar) {
    this._tipoNomVarVigente = tipoNomVar;
  }

  get variables() {
    return this._variables;
  }

  // Identifica un token
  // entrega el token identificado, como un par (objeto ParCadInt:
  // la cadena con el token
  // el tipo de token,
  // si el tipo es negativo es que hubo un error al identificarlo y entrega el número de error
  leeToken() {
    const c = this._infija[this.posicion];
    if (c === "@") {
      return new ParCadInt(c, 0);
    }
    if (
      c.isDigit() ||
      c === this._sepDec ||
      this.posibleNumSignado(this.posicion)
    ) {
      return this.identificaNum(this.posicion);
    }
    if (c.isLetter()) {
      return this.identificaVaroFun(c);
    }
    return this.identificaOper(c);
  }

  // Convierte la cadena que recibe a notación polaca inversa
  // entrega cero si no hubo error o el número de error correspondiente.
  // La expresión en notación polaca queda en la propiedad postFija
  InfAPol() {
    let par;
    let parPila;
    let ind;
    let jerEnt;

    const pilaTrab = [];
    // this.infija = '(' + cadena + ')@'; esto se hace en el constructor
    par = this.preProcesa();
    if (par.jerar < 0) {
      this.numError = par.jerar;
      return this.numError;
    }
    if (this._nuevaCad) {
      this.posicion = 0;
      this.balanceOp = 0;
      this.balancePar = 0;
      this.variables = {
        Pi: Math.PI,
        e: Math.E,
      };
      this.postFija = [];
    }
    if (this.infija.length === 3) {
      // solo contiene los caracteres agregados
      this.numError = -2;
      return this.numError; // error: no hay cadena a procesar
    }
    while (this.posicion < this.infija.length) {
      par = this.leeToken();
      ind = par.jerar;
      if (ind < 0) {
        this.numError = ind;
        return this.numError;
      }
      if (ind === 10) {
        // es un masunario , lo obvia
        break;
      } else if (par.cad === "@") {
        if (this.balancePar > 0) {
          this.numError = -11; // faltan paréntesis derechos
          return this.numError;
        }
        return 0; // no hay error y sale por aquí numError ya es 0
      }
      par.jerar = this.jerarquia[ind][1];
      if (pilaTrab.length === 0) {
        pilaTrab.push(par);
      } else {
        jerEnt = this.jerarquia[ind][0];
        while (
          pilaTrab.length > 0 &&
          jerEnt <= pilaTrab[pilaTrab.length - 1].jerar
        ) {
          parPila = pilaTrab.pop();
          if (parPila.jerar === jerEnt) {
            break;
          } else {
            if (parPila.cad === "-" && parPila.jerar === 4) {
              parPila.jerar = 7;
            }
            this.postFija.push(parPila);
          }
        }
        if (jerEnt !== 0) {
          pilaTrab.push(par);
        }
      }
    }
    // parece que nunca llega a esta parte
    // while (this.pilaTrab.length !== 0) {
    //  this.postFija.push(this.pilaTrab.pop());
    // }
    return 0; // no hay error pero no sale por aqui porque cuando encuentra
    // la @ agregada termina ahí
  }

  // Funcion que se encarga de identificar un número
  // entrega un ParCadInt
  identificaNum(pos) {
    const rex = /[+-]?\d+(?:\.\d*)?(?:e[+-]?\d+)?|[+-]?\.\d*(?:e[+-]?\d+)?/gi;
    rex.lastIndex = pos;
    const partes = rex.exec(this.infija);
    let cadNum = partes[0];
    this._posicion = rex.lastIndex;
    this._hayPari = false;
    const num = Number.parseFloat(cadNum);
    if (Number.isFinite(num)) {
      if (++this._balanceOp > 1) {
        this._posicion -= cadNum.length;
        return new ParCadInt(cadNum, -6); // hay dos operandos seguidos, falta un operador o '('
      }
      this.prodImplicito();
      if (cadNum[0] === "+") {
        cadNum = cadNum.slice(1);
      }
      return new ParCadInt(cadNum, this.tipoOper.Numero); // !! sí fue un número
    }
    if (Number.isNaN(num)) {
      // error:un punto solo (signado o no) no representa un número
      return new ParCadInt(cadNum, -3);
    }
    // error: es un número que solo se puede representar como  +/- infinito
    return new ParCadInt(cadNum, -5);
  }

  // funcion de apoyo a leeToken para ver si es el inicio de un número signado
  posibleNumSignado(pos) {
    const rex = /^[+-][0-9.]/;
    const subcad = this.infija.slice(pos, pos + 2);
    if (this.hayPari) {
      return rex.test(subcad);
    }
    return false;
  }

  // Se encarga de identificar el nombre de una función o bien una variable
  // entrega un ParCadInt
  identificaVaroFun(c) {
    const nombresFunc = [
      "sin",
      "cos",
      "tan",
      "cot",
      "sec",
      "csc",
      "sqrt",
      "abs",
      "exp",
      "ln",
      "asin",
      "acos",
      "atan",
    ];
    let nom = "";
    this.hayPari = false;
    let cLocal = c;
    while (cLocal.isLetter()) {
      nom += cLocal;
      cLocal = this.infija[++this._posicion];
    }
    // this.posicion--;
    this._balanceOp++;
    if (this.balanceOp > 1) {
      this._posicion -= nom.length;
      return new ParCadInt(nom, -6); // error: hay dos operandos seguidos, falta un operador
    }
    const indice = nombresFunc.indexOf(nom);
    if (indice !== -1) {
      this._balanceOp--;
      if (cLocal !== "(") {
        // error: el argumento de la función debe ir entre paréntesis
        return new ParCadInt(nom, -12);
      }
      return new ParCadInt(nombresFunc[indice], this.tipoOper.FuncUnaria);
    }
    return this.identificaVar(nom, cLocal);
  }

  // Identifica una variable.
  // discrimina segun las caracteristicas permitidas para los nombres de variables
  identificaVar(nom, c) {
    if (nom === "Pi" || nom === "e") {
      this.prodImplicito();
      return new ParCadInt(nom, this.tipoOper.Variable);
    }
    let nomLocal = nom;
    let cLocal = c;
    switch (this.tipoNomVarVigente) {
      case this.tipoNomVar.Letra:
        if (nom.length > 1) {
          // error: Sólo acepto nombre de variables o parámetros de una letra
          return new ParCadInt(nom, -13);
        }
        if (c.isDigit()) {
          // error: no se aceptan nombre de variables o parámetros con dígitos.
          // o falta un operador.
          return new ParCadInt(nom, -14);
        }
        break;
      case this.tipoNomVar.LetrayDigitos:
        if (nom.length > 1) {
          // error: Sólo acepto nombre de variables o parámetros de una letra,
          // opcionalmente seguida de dígitos
          return new ParCadInt(nom, -15);
        }
        while (c.isDigit()) {
          nomLocal += cLocal;
          cLocal = this.infija[++this._posicion];
        }
        // this.posicion--;
        break;
      case this.tipoNomVar.Palabra:
        if (c.isDigit()) {
          // error: no se aceptan nombre de variables o parámetros con dígitos.
          // o falta un operador.
          return new ParCadInt(nom, -14);
        }
        break;
      case this.tipoNomVar.PalabrayDigitos:
        while (c.isDigit()) {
          nomLocal += cLocal;
          cLocal = this.infija[++this._posicion];
        }
        // this.posicion--;
        break;
      default:
        // error: ocurrio un error inesperado, al identificar una variable
        return new ParCadInt(nom, -16);
    }
    // si no existe el elemento lo crea, si ya existe, esto no agrega nada
    this.variables[nomLocal] = 0.0;
    this.prodImplicito();
    return new ParCadInt(nomLocal, this.tipoOper.Variable);
  }

  // Identifica un operador
  // entrega un ParCadInt
  identificaOper(c) {
    const operadores = "+-*/^#&#()";
    const ind = operadores.indexOf(c);
    this._posicion++;
    if (ind !== -1) {
      switch (ind) {
        case 0: // signo +
          if (this.hayPari) {
            // es un mas unario, se regresa una jerarquia especial para obviarlo
            this.hayPari = false;
            return new ParCadInt(c, this.tipoOper.MasUnario);
          }
          if (--this._balanceOp < 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -7); // error: hay dos operadores seguidos
          }
          return new ParCadInt(c, ind); // operador binario
        // break;
        case 1: // signo -
          if (this.hayPari) {
            this._hayPari = false;
            return new ParCadInt(c, this.tipoOper.MenosUnario);
          }
          if (--this.balanceOp < 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -7); // error: hay dos operadores seguidos
          }
          return new ParCadInt(c, ind); // operador binario
        case this.tipoOper.ParIzq:
          this._hayPari = true;
          if (this.balanceOp > 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -9); // error: falta un operador antes del paréntesis izq
          }
          this._balancePar++;
          return new ParCadInt(c, ind); // parentésis izquierdo.
        case this.tipoOper.ParDer:
          this._hayPari = false;
          this._balancePar--;
          if (this.balanceOp === 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -10); // error: falta un operando antes del paréntesis Der
          }
          if (this.balancePar < 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -8); // error: paréntesis derechos de más
          }
          this.prodImplicito();
          return new ParCadInt(c, ind); // termina sin error
        case this.tipoOper.Por:
        case this.tipoOper.Div:
        case this.tipoOper.Potencia:
          this._hayPari = false;
          if (--this._balanceOp < 0) {
            this._posicion -= 2;
            return new ParCadInt(c, -7); // error: hay dos operadores seguidos
          }
          return new ParCadInt(c, ind); // termina sin error
        default:
          return new ParCadInt(c, -1); // error: algo extraño paso hay un caracter inválido
      }
    }
    return new ParCadInt(c, -1); // error: hay un caracter inválido
  }

  // Identifica errores por aparicion de dos operadores seguidos.
  // también reduce a un solo punto cuando hay mas de uno seguido en la cadena, sin marcar error
  // inserta el signo * entre ) y ( contigüos
  preProcesa() {
    let rex = /\.{2,}/g;
    this._infija = this.infija.replace(rex, "."); // esto si acaso generara un aviso, no error
    rex = /[+\-*/^]{2,}/g; // /\+{2,}|\+-/g;
    rex.lastIndex = 0;
    const partes = rex.exec(this.infija);
    if (rex.lastIndex > 0) {
      return new ParCadInt(rex.lastIndex - partes[0].length, -7);
    }
    rex = /\)\(/g;
    this._infija = this.infija.replace(rex, ")*(");
    return 0;
  }

  // inserta el signo * cuando aplica
  prodImplicito() {
    const c = this.infija[this.posicion];
    if (c.isLetter() || c === "(") {
      this._infija = `${this.infija.slice(
        0,
        this.posicion
      )}*${this.infija.slice(this.posicion)}`;
    }
  }

  // Evalua la expresión dada en notación polaca inversa en el parámetro: postfija
  // con los valores que tengan al momento las variables o parámetros identificadas como tales
  // almacenadas en el parámetro: variables
  // postFija: un arreglo de pares de tipo ParCadInt
  // variables: un objeto JSON, donde la propiedad es el nombre de la variable y su valor es
  // el valor de la propiedad.
  // entrega un número como resultado o undefined si ocurre un error
  // el número de error lo entrega en la propiedad numError
  Eval(postFija, variables) {
    let numero;
    let oper1;
    let oper2;
    let par;
    const pilaCalc = [];
    for (let i = 0; i < postFija.length; i++) {
      par = postFija[i];
      switch (par.jerar) {
        case 2: // operadores + o - binarios
        case 4: // operadores * o /
        case 5: // operador ^
          if (pilaCalc.length < 2) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          oper2 = pilaCalc.pop();
          pilaCalc.push(InfijaAPolaca.operaBin(oper1, oper2, par.cad));
          break;
        case 7: // operador unario
          if (pilaCalc.length === 0) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          pilaCalc.push(InfijaAPolaca.operaUnario(oper1, par.cad));
          break;
        case 10: // número o variable
          numero = parseFloat(par.cad);
          if (Number.isNaN(numero)) {
            // entonces es una variable
            numero = variables[par.cad];
          }
          pilaCalc.push(numero);
          break;
        default:
          break;
      }
    }
    if (pilaCalc.length > 1) {
      this.numError = -21; // error: sobraron operandos al evaluar!!!
      return undefined;
    }
    this.numError = 0;
    return pilaCalc.pop();
  }

  // Evalua la expresión en notación polaca inversa dada en el parámetro: postfija
  // supone una expresion sin variables y entregara como resultado
  // un objeto de tipo fraccion como se define el Fracciones.js
  // postFija: un arreglo de pares de tipo ParCadInt
  // entrega un objeto de tipo fraccion o undefined si ocurre un error
  // el número de error lo entrega en la propiedad numError
  EvalFracciones(postFija) {
    let numero;
    let oper1;
    let oper2;
    let par;
    const pilaCalc = [];
    for (let i = 0; i < postFija.length; i++) {
      par = postFija[i];
      switch (par.jerar) {
        case 2: // operadores + o - binarios
        case 4: // operadores * o /
        case 5: // operador ^
          if (pilaCalc.length < 2) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          oper2 = pilaCalc.pop();
          pilaCalc.push(InfijaAPolaca.operaBinFraccion(oper1, oper2, par.cad));
          break;
        case 7: // operador menos unario
          if (pilaCalc.length === 0) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          pilaCalc.push(oper1.invAd()); //
          break;
        case 10: // número
          numero = parseInt(par.cad);
          if (Number.isNaN(numero)) {
            this.numError = -22; // error: se perdio un operando
            return undefined;
          }
          pilaCalc.push(new Fraccion(numero));
          break;
        default:
          break;
      }
    }
    if (pilaCalc.length > 1) {
      this.numError = -21; // error: sobraron operandos al evaluar!!!
      return undefined;
    }
    this.numError = 0;
    return pilaCalc.pop();
  }

  EvalLineales(postFija) {
    let numero;
    let oper1;
    let oper2;
    let par;
    const pilaCalc = [];
    for (let i = 0; i < postFija.length; i++) {
      par = postFija[i];
      switch (par.jerar) {
        case 2: // operadores + o - binarios
          if (pilaCalc.length < 2) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          oper2 = pilaCalc.pop();

          if (oper1.isFraccion && oper2.isFraccion) {
            pilaCalc.push(
              InfijaAPolaca.operaBinFraccion(oper1, oper2, par.cad)
            );
          } else {
            if (oper1.isFraccion) {
              oper1 = new Lineal(new Fraccion(0, 1), oper1);
            } else if (oper2.isFraccion) {
              oper2 = new Lineal(new Fraccion(0, 1), oper2);
            }

            // pilaCalc.push(InfijaAPolaca.operaBinLineal(oper1, oper2, par.cad));

            if (par.cad === "+") {
              let resul = oper2.suma(oper1);
              if (resul.isFraccion) {
                pilaCalc.push(resul.ti);
              } else {
                pilaCalc.push(resul);
              }
            } else {
              let resul = oper2.resta(oper1);
              if (resul.isFraccion) {
                pilaCalc.push(resul.ti);
              } else {
                pilaCalc.push(resul);
              }
            }
          }

          break;

        case 4: // operadores * o /
          if (pilaCalc.length < 2) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }

          oper1 = pilaCalc.pop();
          oper2 = pilaCalc.pop();

          //Caso operador "*"

          if (par.cad === "*") {
            if (oper1.isFraccion && oper2.isFraccion) {
              pilaCalc.push(
                InfijaAPolaca.operaBinFraccion(oper1, oper2, par.cad)
              );
            } else if (oper1.isFraccion) {
              let resul = oper2.multiesc(oper1);
              if (resul.isFraccion) {
                pilaCalc.push(resul.ti); // el coef de x es cero guarda solo la fraccion
              } else {
                pilaCalc.push(resul);
              }
            } else if (oper2.isFraccion) {
              let resul = oper1.multiesc(oper2);
              if (resul.isFraccion) {
                pilaCalc.push(resul.ti); // el coef de x es cero guarda solo la fraccion
              } else {
                pilaCalc.push(resul);
              }
            } else {
              this.numError = -23; // error el resultado de la operación no es un termino lineal
              return undefined;
            }
          }

          //Caso operador "/"
          else {
            if (oper1.isFraccion && oper2.isFraccion) {
              let resul = InfijaAPolaca.operaBinFraccion(oper1, oper2, par.cad);
              if (resul.isFraccion) {
                pilaCalc.push(resul);
              } else {
                this.numError = -24; // error: división entre cero. no es un número
                return undefined;
              }
            } else if (oper1.isFraccion) {
              oper1 = oper1.reciproco();
              if (oper1.isFraccion) {
                pilaCalc.push(oper2.multiesc(oper1));
              } else {
                this.numError = -24; // error: división entre cero. no es un número
                return undefined;
              }
            } else if (oper2.isFraccion) {
              this.numError = -23; // error el resultado de la operación no es un termino lineal
              return undefined;
            } else {
              if (oper1.isMultiplo(oper2)) {
                pilaCalc.push(oper2.cx.cociente(oper1.cx));
              } else {
                this.numError = -23; // error el resultado de la operación no es un termino lineal
                return undefined;
              }
            }
          }

          break;

        case 7: // operador menos unario
          if (pilaCalc.length === 0) {
            this.numError = -20; // error: se perdio un operando
            return undefined;
          }
          oper1 = pilaCalc.pop();
          if (oper1.isFraccion) {
            pilaCalc.push(oper1.invAd());
          } else if (oper1.isLineal) {
            pilaCalc.push(new Lineal(oper1.cx.invAd(), oper1.invAd()));
          }
          //
          break;
        case 10: // número
          numero = Number.parseFloat(par.cad);
          if (Number.isNaN(numero)) {
            pilaCalc.push(new Lineal(new Fraccion(1, 1), new Fraccion(0, 1)));
          } else {
            let numInt = Number.parseInt(par.cad);
            if (numInt === numero) {
              pilaCalc.push(new Fraccion(numInt));
            } else {
              pilaCalc.push(new Fraccion(numero, true));
            }
          }
          break;
        default:
          break;
      }
    }
    if (pilaCalc.length > 1) {
      this.numError = -21; // error: sobraron operandos al evaluar!!!
      return undefined;
    }
    this.numError = 0;
    return pilaCalc.pop();
  }

  // calcula las operaciones algebraicas binarias
  // opndo1 y opndo2 estan en el orden de salida del stack
  // por eso se operan en orden inverso cuando no es simétrica la operación
  static operaBin(opndo1, opndo2, operador) {
    switch (operador) {
      case "+":
        return opndo2 + opndo1;
      case "-":
        return opndo2 - opndo1;
      case "*":
        return opndo2 * opndo1;
      case "/":
        return opndo2 / opndo1;
      case "^":
        return opndo2 ** opndo1;
      default:
        return 0; // es un operador inválido, a este nivel no pasa esto
    }
  }

  // calcula las operaciones aritméticas binarias como fraccion
  // opndo1 y opndo2 estan en el orden de salida del stack
  // por eso se operan en orden inverso cuando no es simétrica la operación
  static operaBinFraccion(opndo1, opndo2, operador) {
    switch (operador) {
      case "+":
        return opndo2.suma(opndo1).reduce();
      case "-":
        return opndo2.resta(opndo1).reduce();
      case "*":
        return opndo2.producto(opndo1).reduce();
      case "/":
        return opndo2.cociente(opndo1).reduce();
      // case '^':
      // se supone que el exponente es un entero
      // return opndo2.potencia(opndo1.n);
      default:
        return 0; // es un operador inválido, a este nivel no pasa esto
    }
  }

  static IniciaErrores() {
    InfijaAPolaca.errores[0] = "";
    InfijaAPolaca.errores[1] = "Hay un caracter inválido.";
    InfijaAPolaca.errores[2] = "No hay expresión a procesar.";
    InfijaAPolaca.errores[3] =
      "Un separador(punto) decimal, signado o no, no representa un número.";
    InfijaAPolaca.errores[4] =
      "Un número no puede tener dos separadores(puntos) decimales.";
    InfijaAPolaca.errores[5] =
      "Es un número pero sólo se puede representar por +/- infinito internamente.";
    InfijaAPolaca.errores[6] = "Hay dos operandos seguidos, falta un operador.";
    InfijaAPolaca.errores[7] =
      "Hay dos operadores seguidos, falta un número, una variable o una función.";
    InfijaAPolaca.errores[8] = "La expresión tiene paréntesis derechos de más";
    InfijaAPolaca.errores[9] =
      "Falta un operador antes del parentesis izquierdo.";
    InfijaAPolaca.errores[10] = "Falta un operando (número o variable).";
    InfijaAPolaca.errores[11] = "Faltan paréntesis derechos.";
    InfijaAPolaca.errores[12] =
      "El argumento de una función debe ir entre paréntesis";
    InfijaAPolaca.errores[13] = "Sólo se aceptan variables de una letra.";
    InfijaAPolaca.errores[14] =
      "Después de una variable no acepto un número. Indica la operación explícitamente.";
    InfijaAPolaca.errores[15] =
      "Las variables sólo pueden consistir de una letra opcionalmente seguida de dígitos.";
    InfijaAPolaca.errores[16] =
      "Ocurrio un error inesperado al identificar una variable!!!";
    InfijaAPolaca.errores[17] =
      'No acepto parámetros o más de una variable, denotada por la letra "x".';
    InfijaAPolaca.errores[18] = 'Sólo acepto la variable "x".';
    InfijaAPolaca.errores[19] = "";
    InfijaAPolaca.errores[20] = "Se perdió un operando";
    InfijaAPolaca.errores[21] = "Sobraron operandos al evaluar";
    InfijaAPolaca.errores[22] = "Esperaba un número entero";
    InfijaAPolaca.errores[23] =
      "El resultado de la operación no es un término lineal";
    InfijaAPolaca.errores[24] =
      "División entre cero. el resultado no es un número";
    InfijaAPolaca.errores[25] =
      'Falta el signo igual "=" para que sea una ecuación';
    InfijaAPolaca.errores[26] = "Debe haber una expresión antes del signo =";
    InfijaAPolaca.errores[27] = "Debe haber una expresión después del signo =";
    InfijaAPolaca.errores[28] =
      "NO puede haber más de un igual en una ecuación";
  }
}

// Extiende String para identificar si una cadena con un caracter es un Dígito
String.prototype.isDigit = function () {
  return this.length === 1 && /^\d/.test(this);
};

// Extiende String para identificar si una cadena con un caracter es una letra
String.prototype.isLetter = function () {
  return this.length === 1 && /^[A-Za-z]/.test(this);
};

export default InfijaAPolaca;
