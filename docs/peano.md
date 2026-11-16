# Aritmética de Peano y numeración de Gödel

## Páginas y navegación

El contenido se distribuye por tarea para evitar una sola página extensa:

- `/`: evaluador semántico finito.
- `/peano`: demostraciones automáticas y manuales; los pasos manuales se pueden desplegar individualmente y los errores se abren al comprobar.
- `/peano/axiomas`: axiomas y generador de inducción. El estado de Peano se comparte mediante un layout persistente: cambiar entre estas dos páginas no borra la fórmula ni los pasos. «Usar» y «Añadir a la demostración» regresan al espacio de demostraciones con el contenido elegido.
- `/godel`: codificación y decodificación de fórmulas.
- `/godel/aprender`: lección interactiva, con su avance guardado en el navegador.
- `/godel/teoremas`: referencia formal y editor de esquemas.

El menú principal enlaza las áreas y cada sección tiene navegación local cuando corresponde. La referencia formal se enlaza desde la lección en lugar de incrustarse al final de esta.

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

Todos los pasos deben derivarse de axiomas o reglas admitidas, sin hipótesis abiertas. Este es un comprobador educativo de un subconjunto de reglas válidas en PA; no es un cálculo completo. En el modo manual el usuario escribe primero la fórmula objetivo, elige cada paso y su justificación, y el comprobador exige que la última fórmula coincida con el objetivo. La interfaz muestra la forma simbólica de la regla seleccionada, las fórmulas de sus premisas y la fórmula y significado del axioma P1–P6 elegido.

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
- `{action: "proof", formula?, steps}` → `{valid, steps: [{valid, formula? , error?}], goal?}`. Si se envía `formula`, la última línea debe coincidir con ese objetivo.
- `{action: "prove", formula, maxSteps?: 100}` → `{status: "proved", formula, steps, maxSteps}` o `{status: "notFound", formula, steps: [], reason, message, maxSteps}`. `reason` puede ser `limit`, `unsupported` o `normalFormsDiffer`. Ninguno afirma falsedad.
- `{action: "encode", formula}` → `{canonical, factors: [{token, prime, exponent}], number, expanded}`. Exponentes y entero son cadenas decimales; `number` es null si no se expande.
- `{action: "decode", number}` → `{formula}`. `number` debe ser una cadena decimal.

Límites: 2000 caracteres y 350 tokens por entrada; numerales hasta 50; 1–100 pasos por prueba; hasta 4000 cifras y 350 símbolos para decodificar. No se evalúan cuantificadores recorriendo una aproximación finita de los naturales.

## Verificación

`npm test` incluye sintaxis y precedencia de PA, variables libres, inducción parametrizada, una prueba completa de 0+1=1, las reglas admitidas, rechazo de capturas y dependencias inválidas, codificación exacta con recuperación y contrato HTTP. Las pruebas automáticas reproducen sus certificados en el comprobador manual, contrastan sumas y productos pequeños con aritmética independiente y distinguen límites y objetivos no resueltos de una refutación. `npm run build` compila las dos interfaces.

## Recorrido de incompletitud

### Taller de construcción de esquemas

La referencia en `/godel/teoremas` incluye cuatro actividades: definir demostrabilidad, construir el punto fijo de Gödel y enunciar el primer y el segundo teorema. El alumno elige dos piezas por actividad, ve su propuesta simbólica y puede comprobarla. Los errores de cuantificador, referencia, orden de argumentos, alcance o conclusión reciben explicaciones específicas.

La revisión distingue piezas incompletas, construcciones que necesitan corrección, hipótesis faltantes y propuestas que encajan. Construir la definición de Prov o el punto fijo no requiere asumir consistencia. Aplicar las conclusiones de Gödel–Rosser y del segundo teorema sí la requiere. Se mantienen las condiciones de extensión efectiva de PA y demostrabilidad habitual de la página. Cambiar la teoría, la hipótesis o las piezas invalida la revisión anterior.

Una construcción revisada permite revelar el razonamiento por etapas. El borrador libre sigue disponible, pero su texto no se valida automáticamente. El taller revisa una selección estructurada y sus hipótesis; no implementa un verificador general de metateoremas ni certifica la consistencia de PA.

La entrada principal es ahora una lección de nueve retos en lenguaje cotidiano. Presenta el encargo de construir una máquina que lo demuestre todo; el alumno responde preguntas, recibe explicaciones específicas para cada opción y puede usar dos pistas progresivas o revelar la solución. Las soluciones revisadas con ayuda se distinguen de los retos resueltos. Ambos caminos permiten avanzar; los errores se pueden reintentar sin penalizaciones.

El mapa desbloquea el siguiente reto tras resolver o revisar el actual. El progreso y una reflexión final libre se guardan localmente en el navegador; si el almacenamiento no está disponible, la lección sigue funcionando durante la visita. La restauración valida los datos guardados y respeta el primer reto pendiente. Reiniciar los retos conserva la reflexión. La reflexión no se califica automáticamente.

El código de juguete 0→1, =→2 se presenta como un convenio distinto de la calculadora real. La autorreferencia y el paso de Rosser se identifican como puentes matemáticos explicados intuitivamente, sin simular una verificación formal ni deducir ambas direcciones de G bajo consistencia sola. La versión técnica anterior sigue disponible en un desplegable opcional.

La consulta opcional conserva el recorrido técnico anterior de nueve pasos: hipótesis, codificación de sintaxis y pruebas, representación de Proof, definición de Prov, lema diagonal, no demostrabilidad de G bajo consistencia, papel de la ω-consistencia para su negación, mejora de Rosser, segundo teorema y distinción entre teorías y modelos.

El selector usa PA o una extensión efectiva de PA. El selector de hipótesis distingue ausencia de consistencia asumida, consistencia y ω-consistencia; nunca certifica que PA sea consistente. El argumento de G no se confunde con la oración de Rosser: la consistencia basta para la independencia de R, mientras el recorrido original de G usa ω-consistencia para excluir una prueba de su negación. El segundo teorema se presenta con la demostrabilidad habitual y las condiciones de derivabilidad.

El editor de esquemas permite escribir borradores de la definición de demostrabilidad, el punto fijo de Gödel y los dos teoremas. Es metanotación editable sin validación automática; no amplía la firma del parser ni pretende expandir Proof o calcular un entero concreto de la oración autorreferente. La explicación se refiere al sistema completo de PA, no al subconjunto de reglas implementado por el comprobador educativo.

También se explica por qué el codificador usa paréntesis canónicos y qué cambiaría con una codificación del texto literal. Las referencias están enlazadas en la interfaz.
