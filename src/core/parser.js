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

  static extractCallsFromLine(line, lineNum) {
    const calls = [];
    const clean = line.replace(/\/\/.*$/, '').replace(/#.*$/, '');
    const CONTROL_KEYWORDS = new Set([
      'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'throw', 'typeof',
      'instanceof', 'import', 'export', 'super', 'require', 'class', 'extends', 'const',
      'let', 'var', 'async', 'await', 'yield', 'delete', 'void', 'new', 'try', 'finally'
    ]);
    const regex = /(?:([a-zA-Z0-9_$]+)\.)?([a-zA-Z0-9_$]+)\s*\(/g;
    let match;
    while ((match = regex.exec(clean)) !== null) {
      const receiver = match[1] || null;
      const name = match[2];
      if (CONTROL_KEYWORDS.has(name)) continue;
      if (receiver && CONTROL_KEYWORDS.has(receiver)) continue;
      calls.push({
        name,
        receiver,
        fullCall: receiver ? `${receiver}.${name}` : name,
        line: lineNum
      });
    }
    return calls;
  }

  static parseJavaScriptOrTypeScript(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];
    const fileCalls = [];

    let currentClass = null;
    let classBraceDepth = 0;
    let activeSymbol = null;
    let symbolBraceDepth = 0;
    let totalBraceDepth = 0;

    const CONTROL_KEYWORDS = new Set([
      'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'throw', 'typeof',
      'instanceof', 'import', 'export', 'super', 'require', 'class', 'extends', 'const',
      'let', 'var', 'async', 'await', 'yield', 'delete', 'void', 'new', 'try', 'finally'
    ]);

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // Imports
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

      // Classes
      const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?/);
      if (classMatch) {
        currentClass = classMatch[1];
        classBraceDepth = totalBraceDepth;
        const clsSym = {
          name: classMatch[1],
          kind: 'class',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `class ${classMatch[1]}${classMatch[2] ? ' extends ' + classMatch[2] : ''}`,
          calls: []
        };
        symbols.push(clsSym);
      }

      // Standalone Functions
      const fnMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        const fnSym = {
          name: fnMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `${fnMatch[1]}(${fnMatch[2].trim()})`,
          calls: []
        };
        symbols.push(fnSym);
        activeSymbol = fnSym;
        symbolBraceDepth = totalBraceDepth;
      }

      // Arrow functions / const functions
      const arrowMatch = line.match(/(?:export\s+)?(?:const|let)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/);
      if (arrowMatch) {
        const arrowSym = {
          name: arrowMatch[1],
          kind: 'function',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: line.includes('export'),
          signature: `${arrowMatch[1]}(${arrowMatch[2].trim()})`,
          calls: []
        };
        symbols.push(arrowSym);
        activeSymbol = arrowSym;
        symbolBraceDepth = totalBraceDepth;
      }

      // Class Methods (when inside class body)
      if (currentClass && !fnMatch && !arrowMatch && !classMatch) {
        const methodMatch = line.match(/^\s*(?:static\s+)?(?:async\s+)?(?:\*\s*)?([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{?/);
        if (methodMatch && !CONTROL_KEYWORDS.has(methodMatch[1])) {
          const methodName = methodMatch[1];
          const isCtor = methodName === 'constructor';
          const methodSym = {
            name: methodName,
            kind: isCtor ? 'constructor' : 'method',
            parentClass: currentClass,
            lineStart: lineNum,
            lineEnd: lineNum,
            exported: false,
            signature: `${currentClass}.${methodName}(${methodMatch[2].trim()})`,
            calls: []
          };
          symbols.push(methodSym);
          activeSymbol = methodSym;
          symbolBraceDepth = totalBraceDepth;
        }
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
          signature: `interface ${interfaceMatch[1]}`,
          calls: []
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
          signature: `type ${typeMatch[1]}`,
          calls: []
        });
      }

      // Extract call expressions on this line
      const rawCalls = CodeParser.extractCallsFromLine(line, lineNum);
      const filteredCalls = rawCalls.filter(c => !(c.line === activeSymbol?.lineStart && c.name === activeSymbol?.name));

      if (activeSymbol) {
        activeSymbol.calls.push(...filteredCalls);
      } else {
        fileCalls.push(...filteredCalls);
      }

      // Track brace depth
      for (const ch of line) {
        if (ch === '{') totalBraceDepth++;
        if (ch === '}') {
          totalBraceDepth--;
          if (activeSymbol && totalBraceDepth <= symbolBraceDepth) {
            activeSymbol.lineEnd = lineNum;
            activeSymbol = null;
          }
          if (currentClass && totalBraceDepth <= classBraceDepth) {
            const clsSym = symbols.find(s => s.name === currentClass && s.kind === 'class');
            if (clsSym) clsSym.lineEnd = lineNum;
            currentClass = null;
          }
        }
      }
    });

    return { symbols, imports, exports, calls: fileCalls };
  }

  static parsePython(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];
    const fileCalls = [];

    let currentClass = null;
    let classIndent = -1;
    let activeSymbol = null;
    let activeIndent = -1;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('#')) return;

      const leadingSpaces = line.search(/\S|$/);

      if (activeSymbol && leadingSpaces <= activeIndent && trimmed.length > 0) {
        activeSymbol.lineEnd = Math.max(activeSymbol.lineStart, lineNum - 1);
        activeSymbol = null;
        activeIndent = -1;
      }

      if (currentClass && leadingSpaces <= classIndent && trimmed.length > 0) {
        const clsSym = symbols.find(s => s.name === currentClass && s.kind === 'class');
        if (clsSym) clsSym.lineEnd = Math.max(clsSym.lineStart, lineNum - 1);
        currentClass = null;
        classIndent = -1;
      }

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

      // Classes
      const classMatch = line.match(/^(\s*)class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/);
      if (classMatch) {
        currentClass = classMatch[2];
        classIndent = classMatch[1].length;
        const clsSym = {
          name: classMatch[2],
          kind: 'class',
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: !classMatch[2].startsWith('_'),
          signature: `class ${classMatch[2]}${classMatch[3] ? `(${classMatch[3]})` : ''}`,
          calls: []
        };
        symbols.push(clsSym);
      }

      // Functions / Methods
      const defMatch = line.match(/^(\s*)def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (defMatch) {
        const isMethod = currentClass !== null && defMatch[1].length > classIndent;
        const fnSym = {
          name: defMatch[2],
          kind: isMethod ? 'method' : 'function',
          parentClass: isMethod ? currentClass : undefined,
          lineStart: lineNum,
          lineEnd: lineNum,
          exported: !defMatch[2].startsWith('_'),
          signature: isMethod ? `${currentClass}.${defMatch[2]}(${defMatch[3].trim()})` : `def ${defMatch[2]}(${defMatch[3].trim()})`,
          calls: []
        };
        symbols.push(fnSym);
        activeSymbol = fnSym;
        activeIndent = defMatch[1].length;
      }

      // Extract calls
      const rawCalls = CodeParser.extractCallsFromLine(line, lineNum);
      const filteredCalls = rawCalls.filter(c => !(c.line === activeSymbol?.lineStart && c.name === activeSymbol?.name));
      if (activeSymbol) {
        activeSymbol.calls.push(...filteredCalls);
      } else {
        fileCalls.push(...filteredCalls);
      }
    });

    if (activeSymbol) activeSymbol.lineEnd = lines.length;
    if (currentClass) {
      const clsSym = symbols.find(s => s.name === currentClass && s.kind === 'class');
      if (clsSym) clsSym.lineEnd = lines.length;
    }

    return { symbols, imports, exports, calls: fileCalls };
  }

  static parseGo(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];
    const fileCalls = [];

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
          signature: `func ${fnMatch[1]}(${fnMatch[2]})`,
          calls: []
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
          signature: `type ${typeMatch[1]} ${typeMatch[2]}`,
          calls: []
        });
      }

      const rawCalls = CodeParser.extractCallsFromLine(line, lineNum);
      if (rawCalls.length) fileCalls.push(...rawCalls);
    });

    return { symbols, imports, exports, calls: fileCalls };
  }

  static parseRust(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];
    const fileCalls = [];

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
          signature: `fn ${fnMatch[1]}(${fnMatch[2]})`,
          calls: []
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
          signature: `${structMatch[1]} ${structMatch[2]}`,
          calls: []
        });
      }

      const rawCalls = CodeParser.extractCallsFromLine(line, lineNum);
      if (rawCalls.length) fileCalls.push(...rawCalls);
    });

    return { symbols, imports, exports, calls: fileCalls };
  }

  static parseGeneric(lines) {
    const symbols = [];
    const imports = [];
    const exports = [];
    const fileCalls = [];

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
          signature: fnMatch[0],
          calls: []
        });
      }

      const rawCalls = CodeParser.extractCallsFromLine(line, lineNum);
      if (rawCalls.length) fileCalls.push(...rawCalls);
    });

    return { symbols, imports, exports, calls: fileCalls };
  }
}
