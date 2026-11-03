# Semántica y sintaxis

El dominio es una lista no vacía de cadenas distintas. Cada símbolo funcional declara nombre, aridad y una tabla total: exactamente una salida del dominio para cada tupla de `Dⁿ`. Cada predicado declara nombre, aridad y una relación no vacía de tuplas distintas de `Dⁿ`. La igualdad es la igualdad de elementos del dominio.

## Gramática

```text
fórmula      := equivalencia
equivalencia := implicación ("↔" implicación)*
implicación  := disyunción ("→" implicación)?
disyunción   := conjunción ("∨" conjunción)*
conjunción   := unaria ("∧" unaria)*
unaria       := "¬" unaria | ("∀" | "∃") variable ["."] unaria | átomo
átomo        := predicado ["(" términos ")"] | término "=" término | "(" fórmula ")"
término      := variable | constante | función "(" términos ")"
```

Se aceptan `!`, `&`, `|`, `->` y `<->` como alias de teclado. La precedencia, de mayor a menor, es negación/cuantificadores, conjunción, disyunción, implicación y equivalencia. La implicación agrupa a la derecha. El cuerpo inmediato de un cuantificador es una fórmula unaria; para ampliar su alcance se usan paréntesis: `∀x.(P(x) → Q(x))`.

Una constante es una función de aridad cero. Un identificador no declarado usado como término es una variable. Un nombre de símbolo declarado no puede usarse como variable ligada. El análisis devuelve las variables libres ordenadas alfabéticamente. Antes de evaluar, cada variable libre necesita una asignación del dominio.

## Justificaciones

Cada evaluación devuelve un árbol con valor y razón. Un existencial verdadero muestra el primer testigo según el orden del dominio; un universal falso muestra el primer contraejemplo. Un universal verdadero y un existencial falso enumeran todas las asignaciones del dominio. Los conectivos muestran las razones de las ramas decisivas.

Las entradas inválidas producen HTTP 422 con `error`, `field` y, para errores léxicos o sintácticos, `position`. Nunca se devuelve un valor de verdad junto con un error.
