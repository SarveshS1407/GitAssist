/**
 * Modular Symbol and Dependency Extractor
 * Supports TypeScript, JavaScript, Python, Go, Rust, and generic C-style syntax
 */

export class CodeParser {
  /**
   * Parse symbols and relationships from a file
   */
  static parseFile(fileAnalysis) {
    if (!fileAnalysis.content || fileAnalysis.isBinary) {
      return { symbols: [], imports: [], exports: [] };
    }

    const { content, language } = fileAnalysis;
    const lines = content.split('\n');

    switch (language) {
      case 'TypeScript':
      case 'TypeScript React':
      case 'JavaScript':
      case 'JavaScript React':
        return this.parseJavaScriptOrTypeScript(lines);
      case 'Python':
        return this.parsePython(lines);
      case 'Go':
        return this.parseGo(lines);
      case 'Rust':
        return this.parseRust(lines);
      default:
        return this.parseGeneric(lines);
    }
  }

  static parseJavaScriptOrTypeScript(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // Imports
      // e.g. import { foo, bar } from './module'; or import React from 'react';
      const importMatch = line.match(/^import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^}]+)\})|([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const specifiers = (importMatch[2] ? importMatch[2].split(',').map(s => s.trim().split(/\s+as\s+/)[0]) : [importMatch[1] || importMatch[3]]).filter(Boolean);
        imports.push({
          source: importMatch[4],
          specifiers,
          isDefault: !!importMatch[3],
          isDynamic: false,
          line: lineNum
        });
      }

      // CommonJS requires
      const requireMatch = line.match(/(?:const|let|var)\s+(?:\{([^}]+)\}|([a-zA-Z0-9_$]+))\s*=\s*require\(['"]([^'"]+)['"]\)/);
      if (requireMatch) {
        const specifiers = (requireMatch[1] ? requireMatch[1].split(',').map(s => s.trim()) : [requireMatch[2]]).filter(Boolean);
        imports.push({
          source: requireMatch[3],
          specifiers,
          isDefault: !!requireMatch[2],
          isDynamic: false,
          line: lineNum
        });
      }

      // Exports
      const exportDefault = line.match(/^export\s+default\s+(?:class|function)?\s*([a-zA-Z0-9_$]+)?/);
      if (exportDefault) {
        exports.push({
          name: exportDefault[1] || 'default',
          isDefault: true,
          line: lineNum
        });
      }

      const namedExport = line.match(/^export\s+(?:const|let|var|function|class|interface|type|enum)\s+([a-zA-Z0-9_$]+)/);
      if (namedExport) {
        exports.push({
          name: namedExport[1],
          isDefault: false,
          line: lineNum
        });
      }

      // Functions
      const fnMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `${fnMatch[1]}(${fnMatch[2].trim()})`
        });
      }

      // Arrow functions / const functions
      const arrowMatch = line.match(/(?:export\s+)?(?:const|let)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/);
      if (arrowMatch) {
        symbols.push({
          name: arrowMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `${arrowMatch[1]}(${arrowMatch[2].trim()})`
        });
      }

      // Classes
      const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `class ${classMatch[1]}${classMatch[2] ? ' extends ' + classMatch[2] : ''}`
        });
      }

      // Interfaces (TypeScript)
      const interfaceMatch = line.match(/(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/);
      if (interfaceMatch) {
        symbols.push({
          name: interfaceMatch[1],
          kind: 'interface',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `interface ${interfaceMatch[1]}`
        });
      }

      // Types (TypeScript)
      const typeMatch = line.match(/(?:export\s+)?type\s+([a-zA-Z0-9_$]+)\s*=/);
      if (typeMatch) {
        symbols.push({
          name: typeMatch[1],
          kind: 'type',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `type ${typeMatch[1]}`
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parsePython(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('#')) return;

      // Imports
      const importFrom = line.match(/^from\s+([a-zA-Z0-9_.]+)\s+import\s+(.+)$/);
      if (importFrom) {
        imports.push({
          source: importFrom[1],
          specifiers: importFrom[2].split(',').map(s => s.trim()),
          isDefault: false,
          isDynamic: false,
          line: lineNum
        });
      } else {
        const importDirect = line.match(/^import\s+([a-zA-Z0-9_.]+)/);
        if (importDirect) {
          imports.push({
            source: importDirect[1],
            specifiers: [importDirect[1]],
            isDefault: true,
            isDynamic: false,
            line: lineNum
          });
        }
      }

      // Functions / Methods
      const defMatch = line.match(/^(\s*)def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (defMatch) {
        const isMethod = defMatch[1].length > 0;
        symbols.push({
          name: defMatch[2],
          kind: isMethod ? 'method' : 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: !defMatch[2].startsWith('_'),
          signature: `def ${defMatch[2]}(${defMatch[3].trim()})`
        });
      }

      // Classes
      const classMatch = line.match(/^class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: !classMatch[1].startsWith('_'),
          signature: `class ${classMatch[1]}${classMatch[2] ? `(${classMatch[2]})` : ''}`
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parseGo(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Go imports
      const importSingle = line.match(/^import\s+"([^"]+)"/);
      if (importSingle) {
        imports.push({ source: importSingle[1], specifiers: [], isDefault: true, isDynamic: false, line: lineNum });
      }

      // Functions
      const fnMatch = line.match(/^func\s+(?:\((?:[^)]+)\)\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        const isExported = fnMatch[1][0] === fnMatch[1][0].toUpperCase();
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: isExported,
          signature: `func ${fnMatch[1]}(${fnMatch[2]})`
        });
      }

      // Structs and Interfaces
      const typeMatch = line.match(/^type\s+([a-zA-Z0-9_]+)\s+(struct|interface)/);
      if (typeMatch) {
        const isExported = typeMatch[1][0] === typeMatch[1][0].toUpperCase();
        symbols.push({
          name: typeMatch[1],
          kind: typeMatch[2] === 'struct' ? 'struct' : 'interface',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: isExported,
          signature: `type ${typeMatch[1]} ${typeMatch[2]}`
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parseRust(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Rust use
      const useMatch = line.match(/^use\s+([a-zA-Z0-9_:]+)/);
      if (useMatch) {
        imports.push({ source: useMatch[1], specifiers: [], isDefault: false, isDynamic: false, line: lineNum });
      }

      // fn
      const fnMatch = line.match(/(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('pub '),
          signature: `fn ${fnMatch[1]}(${fnMatch[2]})`
        });
      }

      // struct / enum / trait
      const structMatch = line.match(/(?:pub\s+)?(struct|enum|trait)\s+([a-zA-Z0-9_]+)/);
      if (structMatch) {
        symbols.push({
          name: structMatch[2],
          kind: structMatch[1] === 'trait' ? 'interface' : 'struct',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('pub '),
          signature: `${structMatch[1]} ${structMatch[2]}`
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parseGeneric(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      // Look for function-like patterns
      const fnMatch = line.match(/(?:function|def|void|int|bool|string)\s+([a-zA-Z0-9_]+)\s*\(/);
      if (fnMatch) {
        symbols.push({
          name: fnMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: false,
          signature: fnMatch[0]
        });
      }
    });

    return { symbols, imports, exports };
  }
}
