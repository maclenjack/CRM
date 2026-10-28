import Papa from 'papaparse';

export interface ParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export interface ParseOptions<T> {
  header?: boolean;
  skipEmptyLines?: boolean | 'greedy';
  transformHeader?: (header: string) => string;
  complete?: (results: ParseResult<T>) => void;
  error?: (error: Papa.ParseError, file: File) => void;
}

/**
 * Parse a CSV file using PapaParse with TypeScript support
 */
export function parseCSV<T = Record<string, string>>(
  file: File | string,
  options: ParseOptions<T> = {}
): Promise<ParseResult<T>> {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve, _reject) => {
    const config: Papa.ParseConfig<T> = {
      header: options.header ?? true,
      skipEmptyLines: options.skipEmptyLines ?? 'greedy',
      transformHeader: options.transformHeader ?? ((h) => h.trim()),
      complete: (results) => {
        resolve({
          data: results.data as T[],
          errors: results.errors,
          meta: results.meta,
        });
      },
    };

    // PapaParse accepts File objects directly
    Papa.parse(file as any, config);
  });
}

/**
 * Parse CSV from a string (useful for testing or pre-loaded content)
 */
export function parseCSVString<T = Record<string, string>>(
  csvString: string,
  options: ParseOptions<T> = {}
): Promise<ParseResult<T>> {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve, _reject) => {
    const config: Papa.ParseConfig<T> = {
      header: options.header ?? true,
      skipEmptyLines: options.skipEmptyLines ?? 'greedy',
      transformHeader: options.transformHeader ?? ((h) => h.trim()),
      complete: (results) => {
        resolve({
          data: results.data as T[],
          errors: results.errors,
          meta: results.meta,
        });
      },
    };

    Papa.parse(csvString, config);
  });
}

/**
 * Stream parse large CSV files (memory efficient)
 */
export function streamParseCSV<T = Record<string, string>>(
  file: File,
  onRow: (row: T, index: number) => void,
  options: ParseOptions<T> = {}
): Promise<{ errors: Papa.ParseError[]; meta: Papa.ParseMeta }> {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve, _reject) => {
    let rowIndex = 0;
    const config: Papa.ParseConfig<T> = {
      header: options.header ?? true,
      skipEmptyLines: options.skipEmptyLines ?? 'greedy',
      transformHeader: options.transformHeader ?? ((h) => h.trim()),
      step: (results, _parser) => {
        if (Array.isArray(results.data) && results.data.length > 0) {
          onRow(results.data[0] as T, rowIndex++);
        }
      },
      complete: (results) => {
        resolve({ errors: results.errors, meta: results.meta });
      },
    };

    Papa.parse(file as any, config);
  });
}

/**
 * Validate CSV headers against expected schema
 */
export function validateHeaders(
  actualHeaders: string[],
  expectedHeaders: string[],
  options: { caseSensitive?: boolean; allowExtra?: boolean } = {}
): { valid: boolean; missing: string[]; extra: string[] } {
  const { caseSensitive = false, allowExtra = true } = options;

  const normalize = (s: string) => (caseSensitive ? s : s.toLowerCase().trim());
  const actualSet = new Set(actualHeaders.map(normalize));
  const expectedSet = new Set(expectedHeaders.map(normalize));

  const missing = expectedHeaders.filter((h) => !actualSet.has(normalize(h)));
  const extra = allowExtra
    ? []
    : actualHeaders.filter((h) => !expectedSet.has(normalize(h)));

  return {
    valid: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  };
}
