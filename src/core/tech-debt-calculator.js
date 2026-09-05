/**
 * TechDebtCalculator
 * Calculates codebase technical debt in engineering hours and estimated remediation cost
 * based on SQALE-aligned structural heuristics.
 */
export class TechDebtCalculator {
  /**
   * @param {Object} [options]
   * @param {number} [options.hourlyRate=100] Remediation cost in USD per engineering hour
   */
  constructor(options = {}) {
    this.hourlyRate = options.hourlyRate || 100;
  }

  /**
   * Calculate technical debt
   * @param {Object} data
   * @param {Array} data.files Array of file objects with lineCount
   * @param {Array} [data.cycles=[]] Circular dependency cycles
   * @param {Array} [data.hotspots=[]] High churn hotspot files
   * @param {number} [data.duplicationLines=0] Total duplicated lines
   * @returns {{ totalDebtHours: number, remediationCostUsd: number, sqaleRating: string, debtBreakdown: Object, topDebtFiles: Array }}
   */
  calculate({ files = [], cycles = [], hotspots = [], duplicationLines = 0 } = {}) {
    let complexityHours = 0;
    let architectureHours = 0;
    let duplicationHours = 0;
    let hotspotHours = 0;

    const fileDebtMap = new Map();

    // 1. Complexity Debt: Large & unwieldy files
    for (const file of files) {
      if (!file || !file.relativePath) continue;
      const loc = file.lineCount || 0;
      let fileDebt = 0;
      const issues = [];

      if (loc > 600) {
        const h = Math.round((loc - 600) / 100) * 1.5 + 2;
        complexityHours += h;
        fileDebt += h;
        issues.push(`Mega-file (>600 LOC): recommend decomposing into focused sub-modules (+${h}h)`);
      } else if (loc > 300) {
        const h = 1.5;
        complexityHours += h;
        fileDebt += h;
        issues.push(`Heavy module (>300 LOC): moderate cognitive load (+${h}h)`);
      }

      if (fileDebt > 0) {
        fileDebtMap.set(file.relativePath, {
          file: file.relativePath,
          hours: fileDebt,
          issues
        });
      }
    }

    // 2. Architecture Debt: Circular dependencies (4h per cycle to decouple)
    architectureHours += (cycles.length * 4);
    for (const cycle of cycles) {
      const cycleFiles = Array.isArray(cycle) ? cycle : (cycle.cycle || []);
      for (const f of cycleFiles) {
        const existing = fileDebtMap.get(f) || { file: f, hours: 0, issues: [] };
        existing.hours += 2;
        existing.issues.push('Trapped in circular import loop; requires interface extraction (+2h)');
        fileDebtMap.set(f, existing);
      }
    }

    // 3. Duplication Debt: 1 hour per 50 duplicated lines
    if (duplicationLines > 0) {
      duplicationHours = Number((duplicationLines / 50).toFixed(1));
    }

    // 4. Hotspot Churn Debt: High churn files with risk
    for (const h of hotspots) {
      const churn = h.churnCount || 1;
      if (churn >= 5) {
        const extra = Math.min(6, Math.round(churn * 0.5));
        hotspotHours += extra;
        const existing = fileDebtMap.get(h.relativePath) || { file: h.relativePath, hours: 0, issues: [] };
        existing.hours += extra;
        existing.issues.push(`High commit churn hotspot (${churn} edits); prone to regression (+${extra}h)`);
        fileDebtMap.set(h.relativePath, existing);
      }
    }

    const totalDebtHours = Number((complexityHours + architectureHours + duplicationHours + hotspotHours).toFixed(1));
    const remediationCostUsd = Math.round(totalDebtHours * this.hourlyRate);

    // SQALE Rating
    let sqaleRating = 'A';
    if (totalDebtHours > 80) sqaleRating = 'E';
    else if (totalDebtHours > 45) sqaleRating = 'D';
    else if (totalDebtHours > 25) sqaleRating = 'C';
    else if (totalDebtHours > 10) sqaleRating = 'B';

    const topDebtFiles = Array.from(fileDebtMap.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 15);

    return {
      totalDebtHours,
      remediationCostUsd,
      sqaleRating,
      hourlyRate: this.hourlyRate,
      debtBreakdown: {
        complexityHours: Number(complexityHours.toFixed(1)),
        architectureHours: Number(architectureHours.toFixed(1)),
        duplicationHours: Number(duplicationHours.toFixed(1)),
        hotspotHours: Number(hotspotHours.toFixed(1))
      },
      topDebtFiles
    };
  }
}
