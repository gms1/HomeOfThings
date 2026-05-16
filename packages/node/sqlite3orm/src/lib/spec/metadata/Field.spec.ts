import { Field } from '../../metadata';

describe('Field.parseDbType', () => {
  it('parses simple type without constraints', () => {
    const result = Field.parseDbType('TEXT');
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBeUndefined();
  });

  it('parses INTEGER type', () => {
    const result = Field.parseDbType('INTEGER');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBeUndefined();
  });

  it('parses REAL type', () => {
    const result = Field.parseDbType('REAL');
    expect(result.typeAffinity).toBe('REAL');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBeUndefined();
  });

  it('parses type with NOT NULL', () => {
    const result = Field.parseDbType('INTEGER NOT NULL');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.notNull).toBe(true);
    expect(result.defaultValue).toBeUndefined();
  });

  it('parses type with DEFAULT number', () => {
    const result = Field.parseDbType('INTEGER DEFAULT 42');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBe('42');
  });

  it('parses type with DEFAULT negative number', () => {
    const result = Field.parseDbType('INTEGER DEFAULT -7');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.defaultValue).toBe('-7');
  });

  it('parses type with DEFAULT real number', () => {
    const result = Field.parseDbType('REAL DEFAULT 3.14');
    expect(result.typeAffinity).toBe('REAL');
    expect(result.defaultValue).toBe('3.14');
  });

  it('parses type with DEFAULT string literal', () => {
    const result = Field.parseDbType("TEXT DEFAULT 'sqlite3orm'");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.defaultValue).toBe("'sqlite3orm'");
  });

  it('parses type with DEFAULT string literal containing escaped quotes', () => {
    const result = Field.parseDbType("TEXT DEFAULT 'it''s a test'");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.defaultValue).toBe("'it's a test'");
  });

  it('parses type with DEFAULT expression containing nested parentheses', () => {
    const result = Field.parseDbType("TEXT DEFAULT(datetime('now') || 'Z')");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.defaultValue).toBe("datetime('now') || 'Z'");
  });

  it('parses type with DEFAULT expression in parentheses', () => {
    const result = Field.parseDbType("TEXT DEFAULT('foo')");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.defaultValue).toBe("'foo'");
  });

  it('parses type with NOT NULL and DEFAULT', () => {
    const result = Field.parseDbType("TEXT NOT NULL DEFAULT 'foo'");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.notNull).toBe(true);
    expect(result.defaultValue).toBe("'foo'");
  });

  it('parses type with leading whitespace', () => {
    const result = Field.parseDbType('  INTEGER NOT NULL');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.notNull).toBe(true);
  });

  it('parses type with size parameter', () => {
    const result = Field.parseDbType('VARCHAR(255)');
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.notNull).toBe(false);
  });

  it('parses type with two size parameters', () => {
    const result = Field.parseDbType('DECIMAL(10, 5)');
    expect(result.typeAffinity).toBe('NUMERIC');
    expect(result.notNull).toBe(false);
  });

  it('parses type with size and NOT NULL', () => {
    const result = Field.parseDbType('VARCHAR(255) NOT NULL');
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.notNull).toBe(true);
  });

  it('parses type with size and DEFAULT', () => {
    const result = Field.parseDbType("VARCHAR(100) DEFAULT 'hello'");
    expect(result.typeAffinity).toBe('TEXT');
    expect(result.defaultValue).toBe("'hello'");
  });

  it('parses BLOB type', () => {
    const result = Field.parseDbType('BLOB');
    expect(result.typeAffinity).toBe('BLOB');
  });

  it('parses NUMERIC type', () => {
    const result = Field.parseDbType('NUMERIC');
    expect(result.typeAffinity).toBe('NUMERIC');
  });

  it('parses lowercase numeric with size', () => {
    const result = Field.parseDbType('numeric(18,4)');
    expect(result.typeAffinity).toBe('NUMERIC');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBeUndefined();
  });

  it('parses type with DEFAULT 0', () => {
    const result = Field.parseDbType('INTEGER DEFAULT 0');
    expect(result.typeAffinity).toBe('INTEGER');
    expect(result.defaultValue).toBe('0');
  });

  it('parses type with DEFAULT +number', () => {
    const result = Field.parseDbType('REAL DEFAULT +1.5');
    expect(result.typeAffinity).toBe('REAL');
    expect(result.defaultValue).toBe('+1.5');
  });

  it('parses type with DEFAULT number ending in dot', () => {
    const result = Field.parseDbType('REAL DEFAULT 3.');
    expect(result.typeAffinity).toBe('REAL');
    expect(result.defaultValue).toBe('3.');
  });

  it('parses missing type name with constraints (SQLite allows this)', () => {
    const result = Field.parseDbType('NOT NULL DEFAULT 1');
    expect(result.typeAffinity).toBe('NUMERIC');
    expect(result.notNull).toBe(true);
    expect(result.defaultValue).toBe('1');
  });

  it('parses NULL keyword as constraint when no type is given', () => {
    const result = Field.parseDbType('NULL DEFAULT 1');
    expect(result.typeAffinity).toBe('NUMERIC');
    expect(result.notNull).toBe(false);
    expect(result.defaultValue).toBe('1');
  });

  it('throws on empty string', () => {
    expect(() => Field.parseDbType('')).toThrow("failed to parse ''");
  });

  it('throws on whitespace-only string', () => {
    expect(() => Field.parseDbType('   ')).toThrow("failed to parse '   '");
  });

  it('throws on unclosed parenthesis in DEFAULT expression', () => {
    expect(() => Field.parseDbType("TEXT DEFAULT(datetime('now'")).toThrow(
      "failed to parse 'TEXT DEFAULT(datetime('now'': unclosed parenthesis in DEFAULT expression",
    );
  });
});
