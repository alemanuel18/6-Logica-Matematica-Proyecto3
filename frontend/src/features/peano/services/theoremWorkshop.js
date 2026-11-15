export const workshopTasks = {
  proof: {
    label: 'Expresar que hay una prueba',
    goal: 'Construye la idea «x es demostrable si existe una prueba de x».',
    slots: [
      {
        id: 'quantifier',
        label: '¿Cuántos códigos de prueba necesitamos?',
        options: [
          ['exists', 'Que exista al menos uno'],
          ['all', 'Que todos los números sean pruebas'],
        ],
      },
      {
        id: 'arguments',
        label: '¿Qué papel tiene cada número?',
        options: [
          ['proofFirst', 'p es la prueba; x es la afirmación'],
          ['formulaFirst', 'x es la prueba; p es la afirmación'],
        ],
      },
    ],
    correct: { quantifier: 'exists', arguments: 'proofFirst' },
    errors: {
      quantifier:
        'Basta con encontrar una prueba. Pedir que todos los números sean pruebas exige mucho más que demostrabilidad.',
      arguments:
        'El primer lugar de Proof identifica la prueba y el segundo, la afirmación demostrada. Aquí p es la prueba y x el código de la afirmación.',
    },
    needsConsistency: false,
    reasoning: [
      'Una prueba concreta se puede comprobar paso a paso.',
      'Su código es un número p; el código de la afirmación es x.',
      'Decir que x es demostrable es afirmar que existe al menos uno de esos códigos p.',
    ],
  },
  goedel: {
    label: 'Construir el mensaje de Gödel',
    goal: 'Arma el mensaje G: «No hay una prueba mía dentro de estas reglas».',
    slots: [
      {
        id: 'claim',
        label: '¿Qué dice G sobre una prueba?',
        options: [
          ['notProvable', 'Que no existe una prueba'],
          ['provable', 'Que sí existe una prueba'],
        ],
      },
      {
        id: 'reference',
        label: '¿De qué afirmación está hablando?',
        options: [
          ['self', 'De la propia G, usando su código'],
          ['other', 'De otra afirmación A'],
        ],
      },
    ],
    correct: { claim: 'notProvable', reference: 'self' },
    errors: {
      claim:
        'El mensaje que buscamos habla de no tener una prueba. Un mensaje que afirme tenerla sería otro punto fijo, no el G de este argumento.',
      reference:
        'Para este argumento necesitamos que G hable de su propio código. Hablar de A no construye la autorreferencia que buscamos.',
    },
    needsConsistency: false,
    reasoning: [
      'Primero expresamos «no hay una prueba de la afirmación con este código».',
      'El lema diagonal permite construir G de manera que el código señalado sea el de la propia G.',
      'El sistema demuestra esa equivalencia. Esto construye el mensaje; todavía no concluye su independencia.',
    ],
  },
  rosser: {
    label: 'Enunciar el primer teorema',
    goal: 'Completa la conclusión de Gödel–Rosser bajo la hipótesis de consistencia.',
    slots: [
      {
        id: 'sentence',
        label: '¿Qué mensaje usa la mejora de Rosser?',
        options: [
          ['rosser', 'R, el mensaje modificado por Rosser'],
          ['goedel', 'G, sin modificar el mensaje original'],
        ],
      },
      {
        id: 'conclusion',
        label: '¿Qué posibilidades quedan excluidas?',
        options: [
          ['neither', 'Demostrar el mensaje y demostrar su negación'],
          ['onlyPositive', 'Solo demostrar el mensaje'],
          ['everything', 'Demostrar cualquier afirmación matemática'],
        ],
      },
    ],
    correct: { sentence: 'rosser', conclusion: 'neither' },
    errors: {
      sentence:
        'Para obtener ambas direcciones a partir de consistencia sola usamos R. El argumento original de G requiere una hipótesis adicional para excluir su negación.',
      conclusion:
        'La independencia excluye las dos respuestas para una oración concreta: no hay prueba de ella ni de su negación. No elimina todas las demostraciones del sistema.',
    },
    needsConsistency: true,
    reasoning: [
      'Suponemos reglas efectivas, suficientes para la aritmética, que no llevan a contradicciones.',
      'Rosser construye R comparando los códigos de posibles pruebas de R y de su negación.',
      'Su argumento descarta ambas clases de prueba bajo consistencia.',
      'Por lo tanto, esas reglas dejan al menos una oración sin decidir: son incompletas.',
    ],
  },
  second: {
    label: 'Enunciar el segundo teorema',
    goal: 'Expresa el límite de un sistema consistente cuando intenta demostrar su propia consistencia.',
    slots: [
      {
        id: 'scope',
        label: '¿De quién es la consistencia que se considera?',
        options: [
          ['self', 'Del mismo sistema que intenta demostrarla'],
          ['other', 'De cualquier otro sistema, incluso uno más débil'],
        ],
      },
      {
        id: 'conclusion',
        label: '¿Cuál es el límite que establece el teorema?',
        options: [
          ['cannotProve', 'No demuestra su propia consistencia'],
          ['canProve', 'Siempre demuestra su propia consistencia'],
        ],
      },
    ],
    correct: { scope: 'self', conclusion: 'cannotProve' },
    errors: {
      scope:
        'El teorema habla de la consistencia del propio sistema. No impide que una teoría pruebe la consistencia de otra más débil.',
      conclusion:
        'Con la demostrabilidad habitual, el resultado impide esa prueba interna si el sistema es consistente. No certifica desde fuera que el sistema sea consistente.',
    },
    needsConsistency: true,
    reasoning: [
      'Con(T) expresa que no existe una prueba de una contradicción en T.',
      'Trabajamos con la demostrabilidad habitual y las condiciones que permiten formalizar el razonamiento sobre pruebas.',
      'El segundo teorema establece: si T es consistente, T no demuestra Con(T).',
      'Esto limita lo que T prueba sobre sí mismo; no excluye estudiar su consistencia en una teoría más fuerte.',
    ],
  },
};

export function workshopFormula(schema, choices, theory) {
  const task = workshopTasks[schema];
  if (!task) return '';
  const t = theory === 'T' ? 'T' : 'PA';
  const g = `G_${t}`;
  const r = choices.sentence === 'goedel' ? g : `R_${t}`;
  const get = (id, values) => values[choices[id]] ?? '□';
  switch (schema) {
    case 'proof':
      return `Prov_${t}(x) ≡ ${get('quantifier', { exists: '∃', all: '∀' })}p.Proof_${t}(${get('arguments', { proofFirst: 'p,x', formulaFirst: 'x,p' })})`;
    case 'goedel':
      return `${t} ⊢ (${g} ↔ ${get('claim', { notProvable: '¬', provable: '' })}Prov_${t}(⌜${get('reference', { self: g, other: 'A' })}⌝))`;
    case 'rosser':
      return !choices.sentence || !choices.conclusion
        ? 'Si T es consistente y tiene axiomas efectivos, entonces □.'
        : choices.conclusion === 'everything'
          ? `${t} no demuestra ninguna afirmación matemática.`
          : `${t} ⊬ ${r}${choices.conclusion === 'neither' ? `  y  ${t} ⊬ ¬${r}` : ''}`;
    case 'second':
      return !choices.scope || !choices.conclusion
        ? 'Con(T) expresa que T no demuestra una contradicción. Conclusión: □.'
        : `${t} ${choices.conclusion === 'canProve' ? '⊢' : '⊬'} Con(${choices.scope === 'self' ? t : 'U'})`;
    default:
      return '';
  }
}

export function reviewWorkshop(schema, choices, hypothesis) {
  const task = workshopTasks[schema];
  if (!task) return { status: 'incomplete', messages: ['Elige una actividad.'] };
  if (task.slots.some((slot) => !slot.options.some(([id]) => id === choices[slot.id])))
    return {
      status: 'incomplete',
      messages: ['Completa las dos piezas antes de comprobar la construcción.'],
    };
  const messages = task.slots
    .filter((slot) => choices[slot.id] !== task.correct[slot.id])
    .map((slot) => task.errors[slot.id]);
  if (messages.length) return { status: 'revise', messages };
  if (task.needsConsistency && !['consistent', 'omega'].includes(hypothesis))
    return {
      status: 'missingHypothesis',
      messages: [
        'Las piezas de la conclusión encajan, pero falta asumir consistencia para aplicarla. Sin esa hipótesis, este teorema no permite afirmar la conclusión.',
      ],
    };
  return {
    status: 'ready',
    messages: [
      task.needsConsistency
        ? 'La construcción y las hipótesis encajan con el teorema. Ahora recorre el razonamiento que conecta ambas.'
        : 'La construcción expresa la idea buscada. Para construir este esquema no hace falta asumir consistencia; eso será importante al estudiar qué puede demostrarse.',
    ],
  };
}
