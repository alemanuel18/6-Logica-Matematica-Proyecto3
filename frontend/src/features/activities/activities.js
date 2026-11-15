export const activities = [
  {
    slug: 'cuantificadores',
    number: '01',
    symbol: '∀∃',
    title: 'Duelo de cuantificadores',
    short: 'El orden cambia el juego.',
    description: 'Elige testigos y responde a los movimientos de la máquina.',
    kind: 'Tablero de turnos',
    time: '3–5 min',
  },
  {
    slug: 'contraejemplos',
    number: '02',
    symbol: '↗',
    title: 'Detective de contraejemplos',
    short: 'Un mundo basta para refutar.',
    description: 'Construye relaciones que pongan a prueba una afirmación.',
    kind: 'Mapa de relaciones',
    time: '4–6 min',
  },
  {
    slug: 'turing',
    number: '03',
    symbol: '>_',
    title: 'La consola de Turing',
    short: '¿Termina o sigue ejecutándose?',
    description: 'Explora programas pequeños y los límites de decidir su terminación.',
    kind: 'Consola de ejecución',
    time: '5–8 min',
  },
  {
    slug: 'escape',
    number: '04',
    symbol: '⌑',
    title: 'Escape room lógico',
    short: 'Cuatro puertas. Una salida.',
    description: 'Conecta cuantificadores, modelos, Peano y códigos de Gödel.',
    kind: 'Misión de cuatro salas',
    time: '5–8 min',
  },
  {
    slug: 'demostraciones',
    number: '05',
    symbol: '∴',
    title: 'Encuentra el paso falso',
    short: 'Parece correcto. ¿Lo es?',
    description: 'Localiza el primer error y descubre qué regla se rompió.',
    kind: 'Mesa de revisión',
    time: '3–5 min',
  },
];

export const people = ['Ada', 'Bruno', 'Celia'];
export const edge = (x, y) => `${x}:${y}`;
export function relationFacts(size, edges) {
  const nodes = Array.from({ length: size }, (_, i) => i);
  return {
    everyoneKnowsSomeone: nodes.every((x) => nodes.some((y) => edges.includes(edge(x, y)))),
    someoneKnownByEveryone: nodes.some((y) => nodes.every((x) => edges.includes(edge(x, y)))),
    symmetric: nodes.every((x) =>
      nodes.every((y) => !edges.includes(edge(x, y)) || edges.includes(edge(y, x))),
    ),
  };
}

// Tiny register machine: the complete configuration is (instruction pointer, n).
// No arbitrary source code is evaluated.
export const programs = [
  {
    id: 'countdown',
    name: 'Cuenta atrás',
    initial: 3,
    lines: ['SI n = 0, IR A 4', 'n ← n − 1', 'IR A 1', 'FIN'],
    code: [{ op: 'zero', to: 3 }, { op: 'dec' }, { op: 'jump', to: 0 }, { op: 'halt' }],
    prediction: 'halts',
    why: 'n comienza en 3 y disminuye hasta 0. Entonces se alcanza FIN.',
  },
  {
    id: 'cycle',
    name: 'La vuelta completa',
    initial: 0,
    lines: ['n ← n + 1', 'n ← n − 1', 'IR A 1'],
    code: [{ op: 'inc' }, { op: 'dec' }, { op: 'jump', to: 0 }],
    prediction: 'cycle',
    why: 'Se repite la configuración completa: misma línea y mismo valor de n. Como las instrucciones son deterministas, el ciclo continuará.',
  },
  {
    id: 'growth',
    name: 'Siempre un poco más',
    initial: 0,
    lines: ['n ← n + 1', 'IR A 1'],
    code: [{ op: 'inc' }, { op: 'jump', to: 0 }],
    prediction: 'grows',
    why: 'En este programa concreto, solo se incrementa n y se vuelve a la primera línea. No existe una instrucción FIN alcanzable. Podemos justificarlo leyendo sus reglas, aunque el detector de ciclos no lo resuelva.',
  },
];
export function initialMachine(program) {
  return {
    pc: 0,
    n: program.initial,
    steps: 0,
    status: 'ready',
    seen: [`0:${program.initial}`],
    trace: [],
  };
}
export function stepMachine(program, state) {
  if (state.status === 'halted' || state.status === 'cycle') return state;
  const instruction = program.code[state.pc];
  let { pc, n } = state;
  let status = 'running';
  if (instruction.op === 'halt') status = 'halted';
  else if (instruction.op === 'inc') {
    n++;
    pc++;
  } else if (instruction.op === 'dec') {
    n = Math.max(0, n - 1);
    pc++;
  } else if (instruction.op === 'zero') pc = n === 0 ? instruction.to : pc + 1;
  else if (instruction.op === 'jump') pc = instruction.to;
  const key = `${pc}:${n}`;
  if (status !== 'halted' && state.seen.includes(key)) status = 'cycle';
  return {
    pc,
    n,
    status,
    steps: state.steps + 1,
    seen: [...state.seen, key],
    trace: [
      ...state.trace,
      `#${state.steps + 1} · L${state.pc + 1}: ${program.lines[state.pc]} → n=${n}`,
    ].slice(-30),
  };
}

export const falseProofs = [
  {
    title: 'La prueba de que 2 = 1',
    premise: 'Trabajamos con números reales y suponemos a = b = 1.',
    steps: [
      'a = b',
      'a² = ab',
      'a² − b² = ab − b²',
      '(a − b)(a + b) = b(a − b)',
      'a + b = b, al dividir por a − b',
      '2 = 1, al sustituir a = b = 1',
    ],
    wrong: 4,
    explanation:
      'Como a = b, el divisor a − b vale 0. Dividir por cero no está definido. Los cuatro pasos anteriores sí respetan la igualdad.',
  },
  {
    title: 'Un testigo para todos',
    premise: 'El dominio es {0, 1} y R(x,y) significa x = y.',
    steps: [
      'Para cada x existe y con R(x,y): basta elegir y = x.',
      'Por tanto, existe un mismo testigo y que sirve para todos los x.',
    ],
    wrong: 1,
    explanation:
      'En ∀x.∃y.R(x,y), y puede depender de x. En ∃y.∀x.R(x,y), hay que fijarlo antes. Ni 0 ni 1 son iguales a ambos elementos del dominio.',
  },
  {
    title: 'Una persona se convierte en todas',
    premise: 'El dominio es {Ada, Bruno}. Solo Ada cumple P.',
    steps: [
      'P(Ada).',
      'Existe x tal que P(x), usando Ada como testigo.',
      'Para todo x, P(x), generalizando el caso de Ada.',
    ],
    wrong: 2,
    explanation:
      'Ada es una persona particular, no un elemento arbitrario. Bruno proporciona un contraejemplo a la conclusión universal. La introducción existencial del paso anterior sí era válida.',
  },
];

export const rooms = [
  {
    name: 'La recepción',
    theme: 'Cuantificadores',
    question:
      'La puerta pide: «Cada persona tiene alguna llave que le permite entrar». Aquí x recorre personas e y recorre llaves; Abre(y,x) significa que la llave y sirve a la persona x. ¿Qué orden permite que la llave dependa de la persona?',
    clue: 'Primero se fija una persona; después se busca una llave para ella.',
    options: ['∀x.∃y.Abre(y,x)', '∃y.∀x.Abre(y,x)', '∀x.∀y.Abre(y,x)'],
    correct: 0,
    explanation: '∀x.∃y permite elegir una llave diferente para cada persona.',
  },
  {
    name: 'La sala de los espejos',
    theme: 'Contraejemplos',
    question:
      'Si todos conocen a alguien, ¿qué mundo demuestra que no tiene que existir alguien conocido por todos? Solo existen las flechas indicadas.',
    clue: 'Busca que cada persona tenga una salida y que ninguna reciba flechas de las tres.',
    options: [
      'Ada → Ada; Bruno → Ada; Celia → Ada',
      'No hay ninguna flecha',
      'Ada → Bruno; Bruno → Celia; Celia → Ada',
    ],
    correct: 2,
    explanation:
      'El ciclo satisface que todos conocen a alguien, pero ninguna persona es conocida por todos.',
  },
  {
    name: 'El archivo de Peano',
    theme: 'Aritmética',
    question:
      'Tienes x + 0 = x y x + S(y) = S(x + y). ¿Qué cadena permite abrir el archivo de 0 + 1?',
    clue: 'Recuerda que 1 abrevia S(0). Aplica primero la regla de suma con sucesor.',
    options: ['0 + S(0) = 0 + 0 = 0', '0 + S(0) = S(0 + 0) = S(0)', '0 + S(0) = S(S(0))'],
    correct: 1,
    explanation:
      'La regla recursiva mueve el sucesor fuera de la suma; la regla x + 0 = x reduce después 0 + 0.',
  },
  {
    name: 'La cerradura de Gödel',
    theme: 'Codificación',
    question:
      'La cerradura codifica la secuencia literal «0=0»: 0 ↦ 1, = ↦ 5. Usa 2¹ · 3⁵ · 5¹. ¿Qué número debes introducir? Aquí no se añaden paréntesis ni se usa la forma canónica del codificador principal.',
    clue: '3⁵ = 243. Multiplica 2 × 243 × 5.',
    options: ['2430', '11', '0'],
    correct: 0,
    explanation:
      '2430 conserva los códigos como exponentes de primos. Su valor codifica símbolos, no la verdad de la igualdad.',
  },
];
