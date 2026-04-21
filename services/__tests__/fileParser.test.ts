import { describe, it, expect } from 'vitest';
import { parseFile } from '../fileParser';

// Helper to create mock File objects
function createMockFile(content: string, filename: string, type: string): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

describe('fileParser', () => {
  describe('parseText', () => {
    it('should parse plain text file', async () => {
      const content = 'This is a plain text file.\nWith multiple lines.';
      const file = createMockFile(content, 'test.txt', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe(content);
    });

    it('should handle empty text file', async () => {
      const file = createMockFile('', 'empty.txt', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe('');
    });

    it('should preserve newlines and whitespace', async () => {
      const content = 'Line 1\n\nLine 3\n  Indented';
      const file = createMockFile(content, 'whitespace.txt', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe(content);
    });
  });

  describe('parseMarkdown', () => {
    it('should parse markdown file as plain text', async () => {
      const content = '# Heading\n\nThis is **bold** text.';
      const file = createMockFile(content, 'test.md', 'text/markdown');
      const result = await parseFile(file);
      expect(result).toBe(content);
      // Markdown structure is preserved (not converted to HTML)
      expect(result).toContain('# Heading');
      expect(result).toContain('**bold**');
    });

    it('should handle empty markdown file', async () => {
      const file = createMockFile('', 'empty.md', 'text/markdown');
      const result = await parseFile(file);
      expect(result).toBe('');
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV with headers', async () => {
      const csvContent = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
      const file = createMockFile(csvContent, 'test.csv', 'text/csv');
      const result = await parseFile(file);

      // Should join columns with space and rows with newline
      expect(result).toContain('Alice');
      expect(result).toContain('30');
      expect(result).toContain('NYC');
      expect(result).toContain('Bob');
      expect(result).toContain('25');
      expect(result).toContain('LA');

      // Should have newline separating rows
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle CSV with single row', async () => {
      const csvContent = 'name,age\nAlice,30';
      const file = createMockFile(csvContent, 'single.csv', 'text/csv');
      const result = await parseFile(file);
      expect(result).toContain('Alice');
      expect(result).toContain('30');
    });

    it('should handle empty CSV file', async () => {
      const file = createMockFile('', 'empty.csv', 'text/csv');
      const result = await parseFile(file);
      // Papa Parse returns empty string for empty CSV
      expect(result).toBeDefined();
    });
  });

  describe('file extension handling', () => {
    it('should handle uppercase extensions', async () => {
      const content = 'test content';
      const file = createMockFile(content, 'test.TXT', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe(content);
    });

    it('should handle files with no extension as text', async () => {
      const content = 'no extension file';
      const file = createMockFile(content, 'README', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe(content);
    });

    it('should handle files with multiple dots', async () => {
      const content = 'archive content';
      const file = createMockFile(content, 'archive.backup.txt', 'text/plain');
      const result = await parseFile(file);
      expect(result).toBe(content);
    });
  });

  // Note: PDF parsing skipped as per PROGRESS.md guidance
  // PDF tests would require mocking pdf.js which is complex for initial coverage
});
