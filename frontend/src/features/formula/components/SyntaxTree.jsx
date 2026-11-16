'use client';

import { useState } from 'react';

function nodeLabel(node) {
  switch (node.kind) {
    case 'quantifier':
      return `${node.quantifier}${node.variable}`;
    case 'binary':
      return node.operator;
    case 'not':
      return '¬';
    case 'equality':
      return '=';
    case 'predicate':
    case 'call':
      return node.name;
    case 'name':
      return node.name;
    default:
      return '?';
  }
}

function nodeChildren(node) {
  switch (node.kind) {
    case 'quantifier':
    case 'not':
      return [node.child];
    case 'binary':
      return [node.left, node.right];
    case 'equality':
      return [node.left, node.right];
    case 'predicate':
    case 'call':
      return node.args;
    default:
      return [];
  }
}

function TreeNode({ node, bound = [] }) {
  const children = nodeChildren(node);
  const isQuantifier = node.kind === 'quantifier';
  const nextBound = isQuantifier ? [...bound, node.variable] : bound;
  const isBoundVariable = node.kind === 'name' && bound.includes(node.name);
  const kindLabel = {
    quantifier: 'Cuantificador',
    binary: 'Conectivo',
    not: 'Negación',
    equality: 'Igualdad',
    predicate: 'Predicado',
    call: 'Función',
    name: isBoundVariable ? 'Variable ligada' : 'Término',
  }[node.kind];

  return (
    <li className={isQuantifier ? 'syntax-tree-quantifier' : undefined}>
      <span
        className={`syntax-tree-node syntax-tree-node-${node.kind}${isBoundVariable ? ' is-bound' : ''}`}
        title={kindLabel}
      >
        <strong>{nodeLabel(node)}</strong>
        <small>{kindLabel}</small>
      </span>
      {children.length > 0 && (
        <ul className={isQuantifier ? 'quantifier-scope' : undefined}>
          {children.map((child, index) => (
            <TreeNode key={`${child.kind}-${index}`} node={child} bound={nextBound} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SyntaxTree({ ast, error }) {
  const [open, setOpen] = useState(false);
  const unavailable = !ast;

  return (
    <div className="syntax-tree-control">
      <button
        className="scope-button"
        type="button"
        aria-expanded={open}
        aria-controls="formula-syntax-tree"
        disabled={unavailable}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">⌘</span>
        {open ? 'Ocultar alcance' : 'Ver alcance de cuantificadores'}
      </button>
      {unavailable && (
        <span className="scope-button-help">
          {error ? 'Corrige la fórmula para generar el árbol.' : 'Escribe una fórmula válida.'}
        </span>
      )}
      {open && ast && (
        <figure id="formula-syntax-tree" className="syntax-tree-figure">
          <figcaption>
            <strong>Árbol sintáctico</strong>
            <span>El recuadro verde bajo cada cuantificador delimita su alcance.</span>
          </figcaption>
          <div className="syntax-tree-scroll">
            <div className="syntax-tree" role="img" aria-label="Árbol sintáctico de la fórmula">
              <ul>
                <TreeNode node={ast} />
              </ul>
            </div>
          </div>
          <div className="syntax-tree-legend" aria-hidden="true">
            <span>
              <i className="legend-scope" /> Alcance
            </span>
            <span>
              <i className="legend-bound" /> Variable ligada
            </span>
          </div>
        </figure>
      )}
    </div>
  );
}
