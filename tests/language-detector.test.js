import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LanguageDetector } from '../src/core/language-detector.js';

describe('LanguageDetector', () => {
  test('detects JavaScript and TypeScript extensions', () => {
    assert.strictEqual(LanguageDetector.detect('app.js'), 'JavaScript');
    assert.strictEqual(LanguageDetector.detect('index.ts'), 'TypeScript');
    assert.strictEqual(LanguageDetector.detect('Component.tsx'), 'TypeScript React');
    assert.strictEqual(LanguageDetector.detect('App.jsx'), 'JavaScript React');
  });

  test('detects Python, Rust, Go, and Java', () => {
    assert.strictEqual(LanguageDetector.detect('main.py'), 'Python');
    assert.strictEqual(LanguageDetector.detect('lib.rs'), 'Rust');
    assert.strictEqual(LanguageDetector.detect('server.go'), 'Go');
    assert.strictEqual(LanguageDetector.detect('Main.java'), 'Java');
  });

  test('returns Text for unmatched extensions', () => {
    assert.strictEqual(LanguageDetector.detect('unknown.xyz123'), 'Text');
  });
});
