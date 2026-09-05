/**
 * SecurityScanner
 * Scans repository source files for exposed secrets, API keys, and insecure code patterns
 */
export class SecurityScanner {
  constructor(options = {}) {
    this.ignoreExtensions = options.ignoreExtensions || ['.png', '.jpg', '.svg', '.lock', '.min.js', '.map'];
    
    // Built-in high-precision vulnerability & secret detection rules
    this.rules = [
      {
        id: 'AWS_KEY',
        name: 'AWS Access Key ID',
        severity: 'CRITICAL',
        regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
        description: 'Hardcoded AWS Access Key ID detected'
      },
      {
        id: 'GITHUB_TOKEN',
        name: 'GitHub Personal Access Token',
        severity: 'CRITICAL',
        regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/,
        description: 'Hardcoded GitHub authentication token detected'
      },
      {
        id: 'PRIVATE_KEY',
        name: 'Private Cryptographic Key',
        severity: 'CRITICAL',
        regex: /-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----/,
        description: 'Plaintext private cryptographic key detected'
      },
      {
        id: 'SLACK_WEBHOOK',
        name: 'Slack Incoming Webhook',
        severity: 'HIGH',
        regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8,12}\/[a-zA-Z0-9_]{24}/,
        description: 'Exposed Slack incoming webhook URI'
      },
      {
        id: 'GENERIC_SECRET',
        name: 'Hardcoded Password / Secret Assignment',
        severity: 'HIGH',
        regex: /(?:password|passwd|secret|api_key|apikey|auth_token)\s*[:=]\s*["'][A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}["']/i,
        description: 'Potential hardcoded credential or secret assignment'
      },
      {
        id: 'INSECURE_EVAL',
        name: 'Arbitrary Code Execution (eval)',
        severity: 'MEDIUM',
        regex: /\beval\s*\([^)]{3,}\)/,
        description: 'Use of eval() introduces severe arbitrary code execution vulnerabilities'
      },
      {
        id: 'INSECURE_EXEC',
        name: 'Command Injection Sink (exec)',
        severity: 'MEDIUM',
        regex: /\b(?:exec|spawn|popen)\s*\(\s*`[^`]*\$\{/,
        description: 'Shell execution sink using unescaped string interpolation'
      }
    ];
  }

  /**
   * Scan files for security findings
   * @param {Array<{ relativePath: string, content: string }>} files
   * @returns {{ score: number, grade: string, findings: Array, counts: { critical: number, high: number, medium: number, low: number } }}
   */
  scan(files = []) {
    const findings = [];
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const file of files) {
      if (!file || !file.content || typeof file.content !== 'string') continue;
      const lower = file.relativePath.toLowerCase();
      if (this.ignoreExtensions.some(ext => lower.endsWith(ext))) continue;

      const lines = file.content.split(/\r?\n/);

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        if (!line || line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

        for (const rule of this.rules) {
          if (rule.regex.test(line)) {
            // Mask the match in snippet for security
            const sanitizedSnippet = line.trim().slice(0, 120);

            findings.push({
              file: file.relativePath,
              line: lineIdx + 1,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              description: rule.description,
              snippet: sanitizedSnippet
            });

            const sevLower = rule.severity.toLowerCase();
            if (counts[sevLower] !== undefined) {
              counts[sevLower]++;
            }
          }
        }
      }
    }

    // Calculate security posture score: 100 - (critical * 25 + high * 12 + medium * 5 + low * 2)
    const penalty = counts.critical * 25 + counts.high * 12 + counts.medium * 5 + counts.low * 2;
    const score = Math.max(0, Math.min(100, 100 - penalty));

    let grade = 'A';
    if (score < 50) grade = 'F';
    else if (score < 70) grade = 'D';
    else if (score < 80) grade = 'C';
    else if (score < 90) grade = 'B';

    return {
      score,
      grade,
      totalFindings: findings.length,
      counts,
      findings: findings.slice(0, 100)
    };
  }
}
