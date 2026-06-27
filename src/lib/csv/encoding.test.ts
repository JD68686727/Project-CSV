import { describe, it, expect } from 'vitest';
import { decodeBytes, detectEncoding, readFileSmart, stripBom } from './encoding';

const u8 = (...b: number[]) => new Uint8Array(b);

describe('detectEncoding', () => {
  it('detects BOMs', () => {
    expect(detectEncoding(u8(0xef, 0xbb, 0xbf, 0x61))).toEqual({
      encoding: 'utf-8',
      bom: true,
    });
    expect(detectEncoding(u8(0xff, 0xfe, 0x61, 0x00)).encoding).toBe('utf-16le');
    expect(detectEncoding(u8(0xfe, 0xff, 0x00, 0x61)).encoding).toBe('utf-16be');
  });

  it('treats valid UTF-8 as utf-8', () => {
    // "café" in UTF-8 → é = 0xC3 0xA9
    expect(detectEncoding(u8(0x63, 0x61, 0x66, 0xc3, 0xa9))).toEqual({
      encoding: 'utf-8',
      bom: false,
    });
  });

  it('falls back to windows-1252 for invalid UTF-8 bytes', () => {
    // "café" in Latin-1 → é = 0xE9 (a lone high byte, invalid UTF-8)
    expect(detectEncoding(u8(0x63, 0x61, 0x66, 0xe9)).encoding).toBe('windows-1252');
  });
});

describe('decodeBytes', () => {
  it('decodes UTF-16LE (BOM stripped) and Windows-1252', () => {
    expect(decodeBytes(u8(0xff, 0xfe, 0x68, 0x00, 0x69, 0x00), 'utf-16le')).toBe('hi');
    expect(decodeBytes(u8(0x63, 0x61, 0x66, 0xe9), 'windows-1252')).toBe('café');
  });
});

describe('stripBom', () => {
  it('removes a leading U+FEFF only', () => {
    expect(stripBom('﻿level')).toBe('level');
    expect(stripBom('level')).toBe('level');
  });
});

describe('readFileSmart', () => {
  it('decodes a UTF-16LE file to a clean string', async () => {
    const bytes = u8(0xff, 0xfe, 0x68, 0x00, 0x69, 0x00); // BOM + "hi"
    const file = new File([bytes], 'x.csv');
    const { text, encoding } = await readFileSmart(file);
    expect(encoding).toBe('utf-16le');
    expect(text).toBe('hi');
  });
});
