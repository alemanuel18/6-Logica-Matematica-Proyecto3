# Evaluador semántico · MM3032

Aplicación web para evaluar fórmulas de lógica de primer orden en interpretaciones finitas. Este repositorio implementa los requisitos obligatorios del [enunciado](./MM3032%20-%20Proyecto.pdf); los aportes creativos quedan fuera del alcance.

## Estructura

- `backend`: Node.js y Express. Analiza la fórmula, valida el lenguaje y la interpretación, genera tuplas y determina el valor de verdad con justificación.
- `frontend`: React y Next.js. Presenta formularios y resultados; no evalúa fórmulas.
- `docs/semantica.md`: gramática, precedencia y reglas de evaluación.
- `docs/openapi.yaml`: contrato OpenAPI 3.1 de todas las rutas.

El frontend usa el **App Router de Next.js** para las rutas. Su código se organiza por sección en `src/features`, con componentes, controladores y servicios o repositorios donde la sección tiene lógica o llamadas HTTP. `src/repositories/httpClient.js` concentra el transporte común. En el backend, `src/routes` conecta controladores, los servicios coordinan el análisis y la evaluación, `src/repositories` consulta la interpretación validada y `src/middleware` concentra el manejo de errores. Las reglas lógicas están en `src/domain`.

## Inicio local

Requiere Node.js 22 o superior. Desde la raíz:

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. La API escucha en `http://localhost:4000`. Para producción local:

```bash
npm run build
npm run start -w @evaluador/api
npm run start -w @evaluador/web
```

O con Docker:

```bash
docker compose up --build
```

El navegador llama a la API mediante `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:4000`). En Docker se configura durante la construcción del frontend. `WEB_ORIGIN` controla el origen CORS del backend.

## Uso

1. Ingresa un dominio finito no vacío. Los elementos se separan con coma o salto de línea.
2. Declara funciones y predicados con nombre y aridad. Una función necesita una salida para cada tupla; un predicado necesita al menos una tupla marcada.
3. Escribe una fórmula. Ejemplo con la configuración inicial: `∃x.P(x)`.
4. Si hay variables libres, selecciona un valor del dominio para cada una.
5. Pulsa **Evaluar fórmula**. Los errores aparecen sin valor de verdad; el resultado válido incluye una razón decisiva o una comprobación completa.

## API

`POST /api/tuples` recibe `{ "domain": ["a", "b"], "arities": [0, 1] }` y devuelve las combinaciones por aridad. `POST /api/analyze` recibe la interpretación y fórmula, y devuelve `freeVariables`. `POST /api/evaluate` recibe además `environment` y devuelve `truth`, `result`, `freeVariables` y `explanation`. `GET /api/health` indica disponibilidad.

La especificación completa está en [docs/openapi.yaml](docs/openapi.yaml) y se sirve desde `GET /api/openapi.yaml` para importarla en Swagger UI, Redoc o un cliente OpenAPI.

Ejemplo de evaluación:

```json
{
  "domain": ["a", "b"],
  "functions": [{ "name": "c", "arity": 0, "table": [{ "args": [], "value": "a" }] }],
  "predicates": [{ "name": "P", "arity": 1, "tuples": [["a"]] }],
  "formula": "∃x.P(x)",
  "environment": {}
}
```

La API responde con HTTP 422 para errores de validación y no incluye `truth` en esa respuesta.

## Pruebas

```bash
npm test
npm run build
```

Las pruebas del backend cubren términos, conectivos, variables libres, cuantificadores, evidencia y entradas inválidas. Las pruebas del frontend comprueban la conversión del dominio y la construcción del contrato HTTP. La compilación de Next.js verifica la integración estática de las páginas.
