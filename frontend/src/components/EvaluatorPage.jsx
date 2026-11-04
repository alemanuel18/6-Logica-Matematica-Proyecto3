'use client';

import Link from 'next/link';
import { useEvaluatorController } from '../controllers/useEvaluatorController.js';
import { DomainSection } from '../features/domain/components/DomainSection.jsx';
import { SymbolEditor } from '../features/interpretation/components/SymbolEditor.jsx';
import { FormulaSection } from '../features/formula/components/FormulaSection.jsx';
import { EnvironmentSection } from '../features/environment/components/EnvironmentSection.jsx';
import { ResultSection } from '../features/result/components/ResultSection.jsx';

export function EvaluatorPage() {
  const state = useEvaluatorController();
  return (
    <main className="shell">
      <header className="hero">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">∀</span>
            <span>MM3032 · Lógica Matemática</span>
          </div>
          <Link className="top-link" href="/guia">
            Guía de uso
          </Link>
        </div>
        <div className="hero-content">
          <span className="eyebrow">EVALUADOR SEMÁNTICO</span>
          <h1>Explora el valor de una fórmula.</h1>
          <p>
            Construye una interpretación finita, escribe una fórmula y descubre por qué es verdadera
            o falsa.
          </p>
        </div>
      </header>
      <form onSubmit={state.submit} className="workspace">
        <div className="left-column">
          <DomainSection
            domainText={state.domainText}
            setDomainText={state.setDomainText}
            domain={state.domain}
          />
          <SymbolEditor
            title="Funciones"
            kind="function"
            items={state.functions}
            setItems={state.setFunctions}
            domain={state.domain}
            tupleOptions={state.tupleOptions}
          />
          <SymbolEditor
            title="Predicados"
            kind="predicate"
            items={state.predicates}
            setItems={state.setPredicates}
            domain={state.domain}
            tupleOptions={state.tupleOptions}
          />
        </div>
        <div className="right-column">
          <FormulaSection
            formula={state.formula}
            setFormula={state.setFormula}
            textarea={state.textarea}
            insert={state.insert}
          />
          <EnvironmentSection
            analysisError={state.analysisError}
            freeVariables={state.freeVariables}
            environment={state.environment}
            setEnvironment={state.setEnvironment}
            domain={state.domain}
          />
          <button className="evaluate-button" disabled={state.loading} type="submit">
            {state.loading ? 'Evaluando…' : 'Evaluar fórmula'} <span>→</span>
          </button>
          <ResultSection
            result={state.result}
            error={state.error}
            environment={state.environment}
          />
        </div>
      </form>
      <footer>Evaluador de lógica de primer orden · Interpretaciones finitas</footer>
    </main>
  );
}
