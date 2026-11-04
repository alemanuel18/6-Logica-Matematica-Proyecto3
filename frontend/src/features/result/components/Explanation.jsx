export function Explanation({ node, depth = 0 }) {
  if (!node) return null;
  return (
    <div className={`reason depth-${Math.min(depth, 2)}`}>
      <div className="reason-line">
        <span className={`mini-status ${node.value ? 'true' : 'false'}`}>
          {node.value ? 'V' : 'F'}
        </span>
        <span>{node.reason}</span>
      </div>
      {node.evidence === 'complete' && (
        <p className="evidence-label">Se comprobaron todos los elementos del dominio.</p>
      )}
    </div>
  );
}
