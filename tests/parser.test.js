import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CodeParser } from '../src/core/parser.js';

describe('CodeParser', () => {
  test('extracts JS/TS functions, classes, and imports', () => {
    const file = {
      language: 'JavaScript',
      content: `
import { scanner } from './scanner.js';
import defaultExport from 'lodash';

export class Engine {
  constructor() {}
}

export function computeMetrics(a, b) {
  return a + b;
}
      `
    };

    const result = CodeParser.parseFile(file);

    assert.ok(result.symbols.length >= 2, 'Should extract class and function symbols');
    const classSymbol = result.symbols.find(s => s.name === 'Engine');
    assert.ok(classSymbol, 'Should find Engine class');
    assert.strictEqual(classSymbol.kind, 'class');

    const funcSymbol = result.symbols.find(s => s.name === 'computeMetrics');
    assert.ok(funcSymbol, 'Should find computeMetrics function');
    assert.strictEqual(funcSymbol.kind, 'function');

    assert.ok(result.imports.length >= 2, 'Should extract imports');
  });

  test('extracts Python classes and defs', () => {
    const file = {
      language: 'Python',
      content: `
import os
from sys import argv

class ModelTrainer:
    def __init__(self):
        pass

def train_pipeline(data):
    return data
      `
    };

    const result = CodeParser.parseFile(file);
    const trainer = result.symbols.find(s => s.name === 'ModelTrainer');
    assert.ok(trainer, 'Should find Python class');
    assert.strictEqual(trainer.kind, 'class');

    const fn = result.symbols.find(s => s.name === 'train_pipeline');
    assert.ok(fn, 'Should find Python function');
  });
});
