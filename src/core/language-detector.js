import path from 'node:path';

export const LANGUAGE_MAP = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript React',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript React',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.c': 'C',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.h': 'C/C++ Header',
  '.hpp': 'C++ Header',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'SASS',
  '.less': 'LESS',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.md': 'Markdown',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Bash',
  '.zsh': 'Zsh',
  '.dockerfile': 'Dockerfile',
  'Dockerfile': 'Dockerfile',
  '.toml': 'TOML',
  '.proto': 'Protocol Buffers',
  '.graphql': 'GraphQL',
  '.gql': 'GraphQL'
};

export const LANGUAGE_COLORS = {
  'TypeScript': '#3178c6',
  'TypeScript React': '#2b7489',
  'JavaScript': '#f1e05a',
  'JavaScript React': '#e34c26',
  'Python': '#3572A5',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Java': '#b07219',
  'C': '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  'Ruby': '#701516',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'Shell': '#89e051',
  'Other': '#8b949e'
};

export class LanguageDetector {
  static detect(filePath) {
    const baseName = path.basename(filePath);
    if (LANGUAGE_MAP[baseName]) {
      return LANGUAGE_MAP[baseName];
    }
    const ext = path.extname(filePath).toLowerCase();
    return LANGUAGE_MAP[ext] || 'Text';
  }

  static getColor(language) {
    return LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other'];
  }
}
