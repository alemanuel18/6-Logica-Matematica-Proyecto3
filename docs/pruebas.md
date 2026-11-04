# Pruebas del intérprete

La batería de estrés en `backend/src/stress.test.js` contiene **1,000 evaluaciones válidas** y **100 entradas inválidas**. Usa la semilla fija `0x5e4a2026`: el número de caso en el nombre de cada prueba permite reproducir cualquier fallo.

Cada evaluación válida crea una interpretación nueva con dominio de uno a cuatro elementos; una constante, una función unaria y una binaria con tablas totales; un predicado unario, uno binario y uno de aridad cero. Las fórmulas combinan términos anidados, igualdad, negación, los cuatro conectivos binarios, cuantificadores y variables libres. La mitad de los casos usa alias de teclado (`!`, `&`, `|`, `->`, `<->`).

Un oráculo independiente calcula el valor directamente desde el árbol generado y las tablas originales, sin usar el parser ni el evaluador de producción. Cada caso compara el valor de verdad, el texto del resultado y las variables libres. Para cuantificadores en la raíz también verifica que el primer testigo o contraejemplo sea correcto, o que se enumeren todas las asignaciones cuando corresponde.

Una prueba de cobertura comprueba que la batería incluya los cuatro tamaños de dominio, fórmulas abiertas y cerradas, todos los conectivos y ambos resultados para `∀` y `∃`.

Las 100 entradas inválidas alteran interpretaciones y fórmulas para cubrir sintaxis incompleta, símbolos desconocidos, aridades, dominio duplicado, relaciones que no son listas, funciones incompletas, salidas y tuplas fuera del dominio y entornos faltantes o inválidos. Se comprueba que cada una produzca un error de validación en la sección esperada.

Para ejecutar toda la suite, incluyendo pruebas unitarias y de la API:

```bash
npm test
```

Para ejecutar únicamente la batería de estrés:

```bash
node backend/src/stress.test.js
```

Estas pruebas usan dominios finitos pequeños para cubrir muchas combinaciones de forma rápida. No miden rendimiento con dominios o aridades grandes.
