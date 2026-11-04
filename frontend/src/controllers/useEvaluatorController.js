import { useDomainController } from '../features/domain/controllers/useDomainController.js';
import { useInterpretationController } from '../features/interpretation/controllers/useInterpretationController.js';
import { useFormulaController } from '../features/formula/controllers/useFormulaController.js';
import { useEnvironmentController } from '../features/environment/controllers/useEnvironmentController.js';
import { useResultController } from '../features/result/controllers/useResultController.js';

export function useEvaluatorController() {
  const domain = useDomainController();
  const interpretation = useInterpretationController(domain.domain);
  const formula = useFormulaController();
  const environment = useEnvironmentController(interpretation.interpretation, formula.formula);
  const result = useResultController(environment.payload, environment.setFreeVariables);
  return { ...domain, ...interpretation, ...formula, ...environment, ...result };
}
