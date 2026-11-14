export const LESSON_STORAGE_KEY = 'peano-godel-lesson-v1';

export const lessons = [
  {
    id: 'rules',
    label: 'El encargo',
    title: 'Construye una máquina que lo demuestre todo',
    story:
      'Imagina que te encargan una máquina que resuelva cualquier pregunta sobre los números. Le das unas reglas y ella escribe demostraciones siguiendo esas reglas, paso a paso.',
    scene: ['Reglas que se pueden seguir', 'Una demostración', 'Una conclusión'],
    question: 'Antes de confiar en ella, ¿qué deberíamos exigirle?',
    options: [
      [
        'Que siempre responda muy rápido.',
        'La velocidad ayuda, pero una respuesta rápida puede estar mal. Primero necesitamos una garantía más básica.',
      ],
      [
        'Que no demuestre una afirmación y también su contraria.',
        'Esa es la condición: sus reglas no deben llevar a una contradicción. A esto se le llama consistencia. La vamos a suponer, no a demostrar aquí.',
      ],
      [
        'Que conteste que sí a todas las preguntas.',
        'Así aceptaría tanto una afirmación como su contraria. Dejaríamos de poder confiar en sus demostraciones.',
      ],
    ],
    correct: 1,
    hints: [
      'Piensa en lo que ocurriría si anunciara a la vez «esto se cumple» y «esto no se cumple».',
      'La condición que buscamos evita las contradicciones.',
    ],
    takeaway:
      'Trabajaremos con reglas que no se contradicen y que pueden aplicarse de manera mecánica.',
    formal:
      'El recorrido se refiere a PA o a una extensión efectiva y consistente de PA: un sistema con suficiente aritmética. No se aplica a cualquier juego de reglas ni a toda máquina imaginable.',
  },
  {
    id: 'checking',
    label: 'Revisar una prueba',
    title: 'Revisar una solución no es lo mismo que encontrarla',
    story:
      'La máquina recibe una demostración de veinte líneas. Puede revisar si cada línea sigue las reglas. Otra tarea muy distinta es inventar una demostración cuando nadie se la ha dado.',
    scene: ['Prueba ya escrita', 'Revisar cada paso', 'Aceptar o rechazar esa prueba'],
    question: 'Si la máquina lleva una hora buscando una prueba y no la encuentra, ¿qué sabemos?',
    options: [
      [
        'Que la afirmación es falsa.',
        'Quizá la prueba sea muy larga, o la estrategia de búsqueda no sea adecuada. El tiempo transcurrido no demuestra falsedad.',
      ],
      [
        'Que ninguna prueba puede existir.',
        'No encontrar algo en una búsqueda limitada no demuestra que sea imposible encontrarlo.',
      ],
      [
        'Solo que todavía no encontró una prueba.',
        'Exacto. Buscar sin éxito y demostrar que no existe ninguna prueba son cosas diferentes. Esta distinción será clave.',
      ],
    ],
    correct: 2,
    hints: [
      'No encontrar unas llaves en una habitación no demuestra que no existan.',
      'La pregunta solo nos cuenta lo que pasó durante una búsqueda de una hora.',
    ],
    takeaway: 'Una búsqueda que se detiene sin éxito no demuestra incompletitud.',
    formal:
      'En PA, comprobar una prueba finita es efectivo. La búsqueda automática de esta aplicación tiene límites propios y no es una prueba del teorema de Gödel.',
  },
  {
    id: 'coding',
    label: 'Poner etiquetas',
    title: 'Una expresión también puede tener un número',
    story:
      'Vamos a hacer un código de juguete: el símbolo «0» recibe la etiqueta 1 y el símbolo «=» recibe la etiqueta 2. Como aquí cada etiqueta tiene una sola cifra, podemos leer la secuencia sin perdernos.',
    scene: ['0 → 1', '= → 2', '0 → 1'],
    question: 'Con este pequeño convenio, ¿cómo escribirías el código de «0=0»?',
    options: [
      [
        '121',
        'Sí: copiamos las etiquetas en el mismo orden. No hemos cambiado lo que dice la expresión; le hemos dado otra forma de escribirla.',
      ],
      [
        '4, porque 1+2+1=4.',
        'Al sumar perdemos el orden de los símbolos. Queremos poder reconstruir la expresión original.',
      ],
      [
        '0, porque la igualdad es verdadera.',
        'Estamos codificando los símbolos, no su valor de verdad. Una expresión falsa también puede tener un código.',
      ],
    ],
    correct: 0,
    hints: [
      'Sustituye cada símbolo por su etiqueta, sin hacer una suma.',
      'Primero va 1, después 2 y al final vuelve a ir 1.',
    ],
    takeaway:
      'Podemos poner números a las expresiones conservando la información necesaria para recuperarlas.',
    formal:
      'Este 121 es solo un ejemplo de etiquetas de una cifra. No es el número de Gödel que produce la calculadora de arriba, que utiliza potencias de primos y escritura canónica.',
  },
  {
    id: 'proof-codes',
    label: 'Hablar de pruebas',
    title: 'Ahora ponle una etiqueta a una demostración entera',
    story:
      'También podemos codificar una lista de expresiones y sus pasos. Como las reglas son mecánicas, revisar si una lista es una demostración se convierte en una comprobación sobre números. La aritmética es lo bastante potente para expresar esa comprobación.',
    scene: ['Demostración escrita', 'Número que la codifica', 'Comprobar ese número'],
    question: '¿Qué nueva pregunta podemos expresar usando números?',
    options: [
      [
        '«¿Este número es el código de una prueba de aquella afirmación?»',
        'Eso es. La aritmética puede hablar de demostraciones a través de sus códigos. Este es el puente que necesitábamos.',
      ],
      [
        '«¿Qué afirmación me parece más convincente?»',
        'El código no mide opiniones. Sirve para describir y comprobar símbolos y reglas concretas.',
      ],
      [
        '«¿Todas las expresiones con código son verdaderas?»',
        'Tener código solo significa que podemos representar una expresión. No convierte esa expresión en verdadera ni en demostrable.',
      ],
    ],
    correct: 0,
    hints: [
      'Una etiqueta sirve para identificar un objeto, no para decidir si nos gusta.',
      'Aquí los objetos que identificamos son pruebas y afirmaciones.',
    ],
    takeaway: 'Hablar de números puede ser, indirectamente, hablar de pruebas.',
    formal:
      'La representación aritmética de la relación «p es una prueba de x» es un resultado matemático. Aquí explicamos su función, sin construir la fórmula completa que lo implementa.',
  },
  {
    id: 'self-reference',
    label: 'El mensaje especial',
    title: 'Una afirmación que habla de su propia prueba',
    story:
      'Con esos códigos, Gödel consigue construir una afirmación con este sentido: «Esta afirmación no tiene una demostración dentro de estas reglas». Llamémosla el mensaje G.',
    scene: ['Mensaje G', 'Su propio código', 'Hablar de una prueba de G'],
    question: '¿Qué está diciendo el mensaje G?',
    options: [
      [
        '«Soy falso».',
        'Eso sería la conocida paradoja del mentiroso. G habla de tener una demostración en unas reglas concretas, no dice simplemente que es falso.',
      ],
      [
        '«No hay una demostración mía usando estas reglas».',
        'Exacto. Es una afirmación sobre demostraciones dentro de ese sistema. La referencia a sí misma se consigue mediante códigos.',
      ],
      [
        '«Nadie podrá entenderme jamás».',
        'Entender una afirmación y demostrarla con unas reglas son cosas distintas. Aquí sí podemos comprender lo que G quiere decir.',
      ],
    ],
    correct: 1,
    hints: [
      'Fíjate en las palabras «demostración» y «dentro de estas reglas».',
      'G habla de si hay una prueba suya, no de si alguien la comprende.',
    ],
    takeaway: 'G habla de su propia no demostrabilidad en un sistema determinado.',
    formal:
      'La construcción usa el lema diagonal, que damos aquí como puente matemático: el sistema demuestra G ↔ ¬Prov(⌜G⌝). La frase cotidiana ayuda a entender ese resultado, pero no sustituye su construcción formal.',
  },
  {
    id: 'contradiction',
    label: 'Ponerla a prueba',
    title: 'Supón que la máquina consigue demostrar G',
    story:
      'Por un momento, imagina que la máquina imprime una prueba de G. Al revisar esa prueba, las propias reglas pueden reconocer que sí existe una prueba de G. Pero G dice precisamente que no hay ninguna.',
    scene: ['Hay una prueba de G', 'Las reglas reconocen esa prueba', 'G afirma que no la hay'],
    question: '¿Qué ocurriría si las reglas demostraran G?',
    options: [
      [
        'Aparecería una contradicción entre tener una prueba y no tenerla.',
        'Sí. Al unir la prueba con lo que G expresa, el sistema demostraría que hay una prueba de G y que no la hay. Eso choca con la consistencia que supusimos.',
      ],
      [
        'La máquina tendría que esperar un poco más.',
        'La dificultad ya no es de velocidad: estamos suponiendo que la prueba existe y mirando qué consecuencias tendría.',
      ],
      [
        'G cambiaría su significado para adaptarse.',
        'La afirmación y las reglas se mantienen fijas durante el argumento. No pueden cambiar para esquivar la contradicción.',
      ],
    ],
    correct: 0,
    hints: [
      'Compara «hay una prueba de G» con lo que afirma G.',
      'Recuerda la condición del primer reto: no demostrar afirmaciones contradictorias.',
    ],
    takeaway: 'Si las reglas no se contradicen, no pueden demostrar G.',
    formal:
      'Se utiliza la representación de pruebas y el punto fijo diagonal. Es un argumento desde fuera del sistema, no un paso que nuestro comprobador educativo haya certificado.',
  },
  {
    id: 'other-side',
    label: 'La otra respuesta',
    title: '¿Y si la máquina demuestra lo contrario?',
    story:
      'Ya vimos por qué G no puede demostrarse si las reglas son consistentes. Para decir que el sistema deja una pregunta sin decidir hay que estudiar también la otra respuesta: la negación de G. Esa segunda mitad necesita otro argumento.',
    scene: ['No demuestra G', '¿Demuestra lo contrario?', 'Todavía falta un argumento'],
    question: '¿Cuál es el siguiente paso honesto?',
    options: [
      [
        'Dar por hecho que tampoco puede demostrar lo contrario.',
        'Sería saltarnos una parte importante. No demostrar una afirmación no impide, por sí solo, demostrar su negación.',
      ],
      [
        'Afirmar que todas las reglas son inútiles.',
        'Las reglas pueden demostrar muchísimas cosas. Estamos investigando un límite muy concreto.',
      ],
      [
        'Buscar una razón adicional para excluir también la respuesta contraria.',
        'Exacto. Gödel usó una condición adicional; Rosser encontró después una modificación del mensaje que permite excluir ambas respuestas usando solo consistencia.',
      ],
    ],
    correct: 2,
    hints: [
      'No poder demostrar «sí» no significa automáticamente no poder demostrar «no».',
      'Para dejar una pregunta sin decidir hay que cerrar las dos posibilidades.',
    ],
    takeaway:
      'La segunda mitad no sale gratis: necesitamos justificar también por qué no se demuestra la negación.',
    formal:
      'Para la oración original G, el argumento clásico usa ω-consistencia para excluir ¬G. Rosser construye una oración diferente R y demuestra la independencia de R usando solo consistencia.',
  },
  {
    id: 'rosser',
    label: 'Cerrar las dos puertas',
    title: 'La mejora que permite llegar al resultado completo',
    story:
      'Rosser ajusta el mensaje para comparar los códigos de una posible prueba y de una prueba de su negación. Su argumento muestra que cualquiera de las dos pruebas llevaría a una contradicción. Llamemos R a este nuevo mensaje.',
    scene: [
      '¿Una prueba de R?',
      '¿Una prueba de lo contrario?',
      'Ambas chocan con la consistencia',
    ],
    question: 'Aceptando este paso de Rosser, ¿qué queda fuera del alcance de las reglas?',
    options: [
      [
        'Toda la suma y la multiplicación.',
        'No se pierde lo que ya se podía demostrar. El límite es que hay alguna pregunta que esas reglas no deciden.',
      ],
      [
        'La pregunta R: no demuestran R ni demuestran su negación.',
        'Así cerramos ambas puertas. Ahora sí tenemos una afirmación que el sistema deja sin decidir.',
      ],
      [
        'Solo las preguntas con números muy grandes.',
        'El tamaño de los números no es el punto. El límite depende de lo que puede demostrarse siguiendo esas reglas.',
      ],
    ],
    correct: 1,
    hints: [
      'El nuevo mensaje R no es exactamente G. Su ventaja es que el argumento funciona en las dos direcciones.',
      'Piensa qué significa que ninguna de las dos respuestas tenga una prueba dentro del sistema.',
    ],
    takeaway:
      'Con reglas efectivas, consistentes y suficientemente potentes, hay una afirmación que no se puede demostrar ni refutar dentro del sistema.',
    formal:
      'Este es el puente adicional de Rosser, no una deducción que se siga solo de la frase informal de G. La comparación de códigos permite revisar un conjunto finito de posibles pruebas en cada caso; el argumento completo está en la referencia opcional.',
  },
  {
    id: 'conclusion',
    label: 'Tu conclusión',
    title: 'Ya puedes explicar qué significa «incompleto»',
    story:
      'Volvamos al encargo inicial. Queríamos unas reglas mecánicas para la aritmética que no se contradijeran y que resolvieran todas sus preguntas. El recorrido nos llevó hasta una pregunta que esas mismas reglas no pueden decidir.',
    scene: ['Reglas mecánicas', 'Sin contradicciones', 'Alguna pregunta sin decidir'],
    question: '¿Qué conclusión recoge el resultado sin exagerarlo?',
    options: [
      [
        'Un sistema así, con suficiente aritmética, no puede decidir todas las afirmaciones de su lenguaje.',
        'Esa es la conclusión. Incompleto no significa inútil: significa que, con esas reglas fijas, hay al menos una afirmación que no se demuestra y cuya negación tampoco se demuestra.',
      ],
      [
        'Ninguna afirmación matemática se puede demostrar.',
        'El teorema no elimina las demostraciones que sí existen. Habla de un límite de cada sistema que cumple las condiciones.',
      ],
      [
        'Si buscamos durante más tiempo, desaparecerá cualquier límite.',
        'La falta de una prueba dentro de unas reglas no se arregla esperando más. No estamos hablando solo de una búsqueda lenta.',
      ],
    ],
    correct: 0,
    hints: [
      'Conserva las condiciones del comienzo y recuerda la pregunta que quedó sin decidir.',
      'Basta con que exista alguna afirmación no decidida para que el sistema sea incompleto.',
    ],
    takeaway:
      'Ningún conjunto efectivo y consistente de reglas con suficiente aritmética puede decidirlo todo.',
    formal:
      'Hemos recorrido una explicación intuitiva de la versión Gödel–Rosser. La representación de pruebas, el lema diagonal y el argumento de Rosser se han presentado como puentes explicados, no como una formalización completa.',
  },
];

export function unlockedLesson(responses, revealed) {
  const firstPending = lessons.findIndex(
    (lesson) => responses[lesson.id] !== lesson.correct && !revealed.includes(lesson.id),
  );
  return firstPending === -1 ? lessons.length - 1 : firstPending;
}

export function restoreLesson(saved) {
  const responses = {},
    revealed = [];
  for (const lesson of lessons) {
    const answer = saved?.responses?.[lesson.id];
    if (Number.isInteger(answer) && answer >= 0 && answer < lesson.options.length)
      responses[lesson.id] = answer;
    if (Array.isArray(saved?.revealed) && saved.revealed.includes(lesson.id))
      revealed.push(lesson.id);
  }
  const current = Number.isInteger(saved?.current)
    ? Math.max(0, Math.min(saved.current, unlockedLesson(responses, revealed)))
    : 0;
  return {
    responses,
    revealed,
    current,
    notebook: typeof saved?.notebook === 'string' ? saved.notebook.slice(0, 4000) : '',
  };
}
