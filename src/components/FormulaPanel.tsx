export function FormulaPanel() {
  return (
    <details className="formula-panel">
      <summary>Scoring formulas, categories, and academic-attention rules</summary>
      <div className="formula-grid">
        <article>
          <h3>Overall score</h3>
          <p>
            overall_score = assignment × 0.15 + quiz × 0.15 + midterm × 0.30 + final × 0.40
          </p>
        </article>
        <article>
          <h3>Performance categories</h3>
          <ul>
            <li>90–100: Excellent</li>
            <li>75–89.99: Good</li>
            <li>60–74.99: Average</li>
            <li>Below 60: Needs Improvement</li>
          </ul>
        </article>
        <article>
          <h3>Grades</h3>
          <ul>
            <li>90+: A+</li>
            <li>80–89: A</li>
            <li>70–79: B</li>
            <li>60–69: C</li>
            <li>50–59: D</li>
            <li>Below 50: F</li>
          </ul>
        </article>
        <article>
          <h3>Requires Academic Attention</h3>
          <p>Flagged when overall score &lt; 60 OR attendance &lt; 75% OR final score &lt; 50.</p>
        </article>
      </div>
    </details>
  );
}
