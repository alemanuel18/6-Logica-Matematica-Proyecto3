# Aritmética de Peano y numeración de Gödel

La ruta `/peano` tiene una interfaz independiente del evaluador finito y dos modos: demostración automática y manual. La firma de PA es `0`, `S`, `+`, `*`, `=`. Los conectivos y cuantificadores son de primer orden. La teoría usa los seis axiomas que muestra la interfaz y todas las instancias del esquema de inducción, con cierre universal de sus parámetros. El esquema también implica que todo natural distinto de cero tiene predecesor; no se necesita añadir este como un séptimo axioma.

Referencias de contenido: [Open Logic Project, Incompleteness and Computability](https://ic.openlogicproject.org/ic-screen.pdf) y [Ernest Schimmerling, Basic and Intermediate Logic, capítulo 5](https://www.math.cmu.edu/~eschimme/300Book/400-Page-5.html). Se usa la firma reducida sin orden ni exponenciación.

## Sintaxis

Las variables cumplen `[a-z][a-z0-9_]*`. Los numerales 1–50 abrevian sucesores de cero. `!=` y `≠` abrevian la negación de igualdad; `·` se acepta como producto. Se aceptan `->`, `<->`, `!`, `&`, `|`. La precedencia es sucesor, producto, suma, igualdad, negación/cuantificación, conjunción, disyunción, implicación y equivalencia. La implicación asocia a la derecha; las demás operaciones binarias asocian a la izquierda. Un cuantificador alcanza la siguiente fórmula unaria; usa `∀x.(...)` para incluir una fórmula compuesta.

Las fórmulas canónicas llevan paréntesis explícitos y expanden los numerales. El comparador de pruebas compara árboles sintácticos: tolera espacios, paréntesis redundantes, alias y numerales, pero no renombra automáticamente variables ligadas ni aplica conmutatividad u otras identidades implícitas.

## Demostración automática

El usuario ingresa una fórmula y el motor intenta construir un certificado: una lista de pasos con fórmulas, reglas, referencias y términos de instanciación. Antes de devolver éxito, el servidor comprueba todos los pasos con `checkProof`, el mismo verificador del modo manual. La última fórmula del certificado siempre es el objetivo solicitado; se eliminan pasos sin uso y se renumeran las referencias. La interfaz muestra los pasos y permite abrirlos como una demostración manual editable. Cambiar de modo conserva el trabajo manual; editar la fórmula o el presupuesto invalida el resultado automático anterior.

Las estrategias actuales reconocen axiomas e instancias, normalizan términos con P3–P6 y congruencia, unen igualdades por simetría y transitividad e introducen cuantificadores universales y conjunciones. Para un existencial se buscan testigos entre 0 y 5, comprobando cada instancia y rechazando captura de variables. Las variables libres se mantienen simbólicas; no se asignan valores arbitrarios.

Ejemplos: `2+2=4`, `2*3=6`, `∀x.(x+1=S(x))`, `∃x.(x+1=3)`. El motor aún no busca pruebas generales por inducción; por ejemplo `∀x.(0+x=x)` puede quedar sin resolver aunque sea un teorema de PA.

El presupuesto admite 10–100 pasos (interfaz: 25, 50 o 100), con un máximo fijo de 2000 operaciones de búsqueda, profundidad de normalización 60 y profundidad de objetivos 30. También se respetan los límites sintácticos del comprobador manual. Si no alcanza, el resultado es `notFound`, sin pasos parciales presentados como solución. Esto no significa que la fórmula sea falsa ni indemostrable. No existe un algoritmo que decida todas las fórmulas de PA; véase [Open Logic Project: teorías consistentes con Q e indecidibilidad](https://builds.openlogicproject.org/content/incompleteness/theories-computability/consis-with-q.pdf).

## Comprobación manual de pruebas

Todos los pasos deben derivarse de axiomas o reglas admitidas, sin hipótesis abiertas. Este es un comprobador educativo de un subconjunto de reglas válidas en PA; no es un cálculo completo. En el modo manual el usuario elige cada paso y su justificación.

- `axiom`: copia exacta de P1–P6, identificado por `axiom`.
- `induction`: instancia generada desde `body` y `variable`. Sustituye solo ocurrencias libres y cierra universalmente los parámetros restantes, en orden alfabético.
- `forallElim`: primera referencia `∀x.φ`, con `term` libre para x. Se rechaza captura de variables, incluso si la fórmula resultante parece sintácticamente correcta.
- `forallIntro`: primera referencia φ, conclusión `∀x.φ`, con `variable`. Es válida porque no hay hipótesis abiertas.
- `mp`: referencias A→B y A, en ese orden; conclusión B.
- `refl`: término `term`; conclusión t=t.
- `sym`: referencia a=b; conclusión b=a.
- `trans`: referencias a=b y b=c; conclusión a=c.
- `successor`: referencia a=b; conclusión S(a)=S(b).
- `congruence`: referencias a=b y c=d; `operator` es `+` o `*`. Conclusión a+c=b+d o a*c=b*d.
- `existsIntro`: referencia φ[x:=t]; conclusión ∃x.φ, con testigo `term` libre para x.
- `andIntro`: referencias A y B; conclusión A∧B.
- `andLeft` / `andRight`: referencia A∧B; conclusión A / B.

`refs` contiene números de pasos empezando en 1. Una referencia futura, inexistente o inválida invalida el paso dependiente. Cada edición de la interfaz borra el resultado anterior, para no mostrar una comprobación obsoleta.

## Convenio de Gödel

Los códigos fijos de `0 S + * = ¬ ∧ ∨ → ↔ ∀ ∃ ( ) .` son, en ese orden, 1–15. El código 16 se reserva. Una variable recibe 16 más su valor en base 38, con caracteres `abcdefghijklmnopqrstuvwxyz0123456789_` asignados a dígitos 1–37. Es una codificación inyectiva y no depende del orden en que aparezcan variables.

Para los símbolos canónicos s₁…sₙ se calcula `∏ pᵢ^c(sᵢ)`, con los primeros n primos consecutivos. Se usa `BigInt`; nunca se convierte el entero codificado a un número de coma flotante. La factorización es siempre exacta. La expansión decimal solo se calcula hasta 12 000 bits estimados. El decodificador comprueba que no falten primos, que cada exponente codifique un símbolo permitido y que el resultado sea una fórmula canónica válida. No todo entero representa una fórmula.

Este convenio es didáctico y no pretende reproducir la codificación histórica. Por ahora se codifican fórmulas individuales, no secuencias de demostraciones ni predicados aritméticos de demostrabilidad.

## API

`POST /api/peano`, con cuerpo JSON. Los errores de solicitud usan HTTP 422 y el formato habitual `{error, field, position}`. Una prueba con pasos incorrectos devuelve HTTP 200 y `valid: false`, con errores individuales.

- `{action: "analyze", formula}` → `{canonical, freeVariables}`.
- `{action: "induction", body, variable}` → `{formula}`.
- `{action: "proof", steps}` → `{valid, steps: [{valid, formula? , error?}]}`.
- `{action: "prove", formula, maxSteps?: 100}` → `{status: "proved", formula, steps, maxSteps}` o `{status: "notFound", formula, steps: [], reason, message, maxSteps}`. `reason` puede ser `limit`, `unsupported` o `normalFormsDiffer`. Ninguno afirma falsedad.
- `{action: "encode", formula}` → `{canonical, factors: [{token, prime, exponent}], number, expanded}`. Exponentes y entero son cadenas decimales; `number` es null si no se expande.
- `{action: "decode", number}` → `{formula}`. `number` debe ser una cadena decimal.

Límites: 2000 caracteres y 350 tokens por entrada; numerales hasta 50; 1–100 pasos por prueba; hasta 4000 cifras y 350 símbolos para decodificar. No se evalúan cuantificadores recorriendo una aproximación finita de los naturales.

## Verificación

`npm test` incluye sintaxis y precedencia de PA, variables libres, inducción parametrizada, una prueba completa de 0+1=1, las reglas admitidas, rechazo de capturas y dependencias inválidas, codificación exacta con recuperación y contrato HTTP. Las pruebas automáticas reproducen sus certificados en el comprobador manual, contrastan sumas y productos pequeños con aritmética independiente y distinguen límites y objetivos no resueltos de una refutación. `npm run build` compila las dos interfaces.
