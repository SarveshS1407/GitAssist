/**
 * ReportGenerator
 * Synthesizes all excavation telemetry into an exportable forensic audit report.
 */
export class ReportGenerator {
  /**
   * Generate markdown report
   * @param {Object} data
   * @returns {string} Markdown text
   */
  static generateMarkdown(data = {}) {
    const {
      repository = 'Unknown Repository',
      summary = {},
      security = {},
      techDebt = {},
      busFactor = {},
      duplication = {},
      endpoints = {},
      hotspots = [],
      cycles = []
    } = data;

    const dateStr = new Date().toISOString().split('T')[0];

    return `# 🛡️ GitAssist Forensic Audit Report: ${repository}
*Generated on ${dateStr} • 100% Air-Gapped Analysis*

---

## 📊 Executive Scorecard

| Metric | Evaluation | Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Security Posture** | **${security.score ?? 100}/100 (Grade ${security.grade ?? 'A'})** | ≥ 85 | ${security.score >= 85 ? '✅ Pass' : '⚠️ Attention'} |
| **Technical Debt** | **${techDebt.totalDebtHours ?? 0} Hours ($${(techDebt.remediationCostUsd ?? 0).toLocaleString()})** | SQALE Grade ${techDebt.sqaleRating ?? 'A'} | ${techDebt.sqaleRating === 'A' || techDebt.sqaleRating === 'B' ? '✅ Manageable' : '⚠️ Elevated'} |
| **Bus Factor** | **${busFactor.overallBusFactor ?? 1} (${busFactor.riskLevel ?? 'LOW'} Risk)** | ≥ 3 | ${busFactor.overallBusFactor >= 3 ? '✅ Resilient' : '⚠️ Siloed'} |
| **Code Duplication** | **${duplication.duplicationPercentage ?? 0}%** | < 5% | ${duplication.duplicationPercentage < 5 ? '✅ Clean' : '⚠️ Review'} |
| **Circular Loops** | **${cycles.length} Dependency Cycles** | 0 Cycles | ${cycles.length === 0 ? '✅ Pristine' : '❌ Refactor'} |

---

## 🏛️ Architecture & Codebase Metrics
- **Total Files**: ${summary.fileCount ?? 0}
- **Total Lines of Code**: ${(summary.totalLines ?? 0).toLocaleString()}
- **Primary Languages**: ${Array.isArray(summary.languages) ? summary.languages.join(', ') : 'N/A'}
- **Detected HTTP Endpoints**: ${endpoints.totalEndpoints ?? 0}

---

## 🔒 Security Audit & Secret Detection
- **Critical Findings**: ${security.counts?.critical ?? 0}
- **High Severity**: ${security.counts?.high ?? 0}
- **Medium / Low**: ${(security.counts?.medium ?? 0) + (security.counts?.low ?? 0)}

${(security.findings && security.findings.length > 0)
  ? security.findings.slice(0, 10).map(f => `- **[${f.severity}]** \`${f.file}:${f.line}\` - ${f.description}`).join('\n')
  : '*No critical security vulnerabilities or plaintext secrets detected.*'}

---

## ⏱️ Technical Debt Breakdown (SQALE)
- **Architecture Refactoring**: ${techDebt.debtBreakdown?.architectureHours ?? 0} hours
- **Complexity Decomposition**: ${techDebt.debtBreakdown?.complexityHours ?? 0} hours
- **Duplication Consolidation**: ${techDebt.debtBreakdown?.duplicationHours ?? 0} hours
- **Hotspot Stabilization**: ${techDebt.debtBreakdown?.hotspotHours ?? 0} hours

${(techDebt.topDebtFiles && techDebt.topDebtFiles.length > 0)
  ? '### Top Priority Refactoring Targets:\n' + techDebt.topDebtFiles.slice(0, 5).map(f => `1. **\`${f.file}\`** (${f.hours}h debt)\n${f.issues.map(i => `   - ${i}`).join('\n')}`).join('\n')
  : ''}

---

## 👥 Knowledge Silos & Bus Factor
- **Sole-Maintainer Silos**: ${busFactor.siloCount ?? 0}
${(busFactor.silos && busFactor.silos.length > 0)
  ? busFactor.silos.slice(0, 5).map(s => `- **\`${s.module}\`**: Sole maintainer **${s.soleMaintainer}** (${s.ownershipPercentage}% of commits)`).join('\n')
  : '*Contributions are evenly distributed across the team.*'}

---
*Report automatically compiled by GitAssist Intelligence Engine.*
`;
  }
}
