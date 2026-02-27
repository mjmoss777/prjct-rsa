/**
 * Zero-dependency PDF text extractor.
 * Uses only node:zlib for FlateDecode decompression.
 *
 * Extracts: text, page count, font names, metadata, image presence.
 */
import { inflateSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PdfReadResult = {
  text: string;
  pageCount: number;
  fontNames: string[];
  hasImages: boolean;
  metadata: Record<string, string>;
};

type PdfObject =
  | PdfDict
  | PdfArray
  | PdfName
  | PdfString
  | PdfRef
  | number
  | boolean
  | null;

type PdfDict = { type: 'dict'; map: Map<string, PdfObject> };
type PdfArray = { type: 'array'; items: PdfObject[] };
type PdfName = { type: 'name'; value: string };
type PdfString = { type: 'string'; value: string };
type PdfRef = { type: 'ref'; objNum: number; gen: number };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isDict(o: PdfObject): o is PdfDict {
  return o !== null && typeof o === 'object' && 'type' in o && o.type === 'dict';
}

function isArray(o: PdfObject): o is PdfArray {
  return o !== null && typeof o === 'object' && 'type' in o && o.type === 'array';
}

function isName(o: PdfObject): o is PdfName {
  return o !== null && typeof o === 'object' && 'type' in o && o.type === 'name';
}

function isString(o: PdfObject): o is PdfString {
  return o !== null && typeof o === 'object' && 'type' in o && o.type === 'string';
}

function isRef(o: PdfObject): o is PdfRef {
  return o !== null && typeof o === 'object' && 'type' in o && o.type === 'ref';
}

function dictGet(dict: PdfDict, key: string): PdfObject {
  return dict.map.get(key) ?? null;
}

function nameVal(o: PdfObject): string | undefined {
  return isName(o) ? o.value : undefined;
}

function numVal(o: PdfObject): number | undefined {
  return typeof o === 'number' ? o : undefined;
}

// ---------------------------------------------------------------------------
// Tokenizer / Object parser
// ---------------------------------------------------------------------------

class PdfParser {
  private buf: Buffer;
  private pos = 0;
  private xrefOffsets = new Map<number, number>(); // objNum → byte offset
  private objectCache = new Map<number, PdfObject>();
  private objStreamCache = new Map<number, Map<number, PdfObject>>();

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  // -- public entry point ---------------------------------------------------

  read(): PdfReadResult {
    this.buildXref();
    const root = this.resolveRef(this.getTrailerRoot());
    if (!isDict(root)) throw new Error('Invalid PDF: no catalog');

    const pages = this.collectPages(root);
    const pageCount = pages.length;

    const fontNames = new Set<string>();
    const textParts: string[] = [];
    let hasImages = false;

    for (const page of pages) {
      const { text, fonts, images } = this.extractPage(page);
      textParts.push(text);
      for (const f of fonts) fontNames.add(f);
      if (images) hasImages = true;
    }

    const metadata = this.extractMetadata();

    return {
      text: textParts.join('\n'),
      pageCount,
      fontNames: [...fontNames],
      hasImages,
      metadata,
    };
  }

  // -- xref parsing ---------------------------------------------------------

  private trailerDict: PdfDict | null = null;

  private buildXref() {
    const startxref = this.findStartXref();
    this.parseXrefAt(startxref);
  }

  private findStartXref(): number {
    // Search last 1024 bytes for "startxref"
    const tail = this.buf.subarray(Math.max(0, this.buf.length - 1024));
    const str = tail.toString('latin1');
    const idx = str.lastIndexOf('startxref');
    if (idx === -1) throw new Error('Invalid PDF: no startxref');
    const after = str.substring(idx + 9).trim();
    const offset = parseInt(after, 10);
    if (isNaN(offset)) throw new Error('Invalid PDF: bad startxref offset');
    return offset;
  }

  private parseXrefAt(offset: number) {
    this.pos = offset;
    this.skipWhitespace();

    // Check if it's a cross-reference stream (PDF 1.5+) or traditional table
    const peek = this.buf.toString('latin1', this.pos, this.pos + 4);
    if (peek.startsWith('xref')) {
      this.parseTraditionalXref();
    } else {
      // Cross-reference stream — it's an object
      this.parseXrefStream(offset);
    }
  }

  private parseTraditionalXref() {
    this.pos += 4; // skip "xref"
    this.skipWhitespace();

    while (this.pos < this.buf.length) {
      const line = this.peekLine();
      if (line.startsWith('trailer')) break;

      // subsection header: startObj count
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) break;
      const startObj = parseInt(parts[0], 10);
      const count = parseInt(parts[1], 10);
      if (isNaN(startObj) || isNaN(count)) break;
      this.advanceLine();

      for (let i = 0; i < count; i++) {
        const entryLine = this.readFixedLine(20);
        const entryParts = entryLine.trim().split(/\s+/);
        if (entryParts.length < 3) continue;
        const byteOffset = parseInt(entryParts[0], 10);
        const flag = entryParts[2];
        if (flag === 'n' && !this.xrefOffsets.has(startObj + i)) {
          this.xrefOffsets.set(startObj + i, byteOffset);
        }
      }
    }

    // Parse trailer dict — scan forward from current position for "trailer"
    const remaining = this.buf.toString('latin1', this.pos, Math.min(this.pos + 512, this.buf.length));
    const trailerIdx = remaining.indexOf('trailer');
    if (trailerIdx !== -1) {
      this.pos = this.pos + trailerIdx + 7;
      this.skipWhitespace();
      const trailer = this.parseObject();
      if (isDict(trailer)) {
        // First (most recent) trailer wins for Root
        if (!this.trailerDict) this.trailerDict = trailer;
        const prev = numVal(dictGet(trailer, 'Prev'));
        if (prev !== undefined) {
          this.parseXrefAt(prev);
        }
      }
    }
  }

  private parseXrefStream(offset: number) {
    this.pos = offset;
    // Parse the stream object
    const obj = this.parseIndirectObject();
    if (!isDict(obj)) return;

    // The xref stream dict also acts as the trailer
    if (!this.trailerDict) this.trailerDict = obj;

    const size = numVal(dictGet(obj, 'Size')) ?? 0;
    const wArr = dictGet(obj, 'W');
    if (!isArray(wArr)) return;
    const w = wArr.items.map((x) => (typeof x === 'number' ? x : 0));
    if (w.length < 3) return;

    const indexArr = dictGet(obj, 'Index');
    let segments: number[];
    if (isArray(indexArr)) {
      segments = indexArr.items.map((x) => (typeof x === 'number' ? x : 0));
    } else {
      segments = [0, size];
    }

    const streamData = this.getStreamData(obj);
    if (!streamData) return;

    let dataPos = 0;
    const rowSize = w[0] + w[1] + w[2];

    for (let s = 0; s < segments.length; s += 2) {
      const startObj = segments[s];
      const count = segments[s + 1];
      for (let i = 0; i < count; i++) {
        if (dataPos + rowSize > streamData.length) break;
        const type = w[0] > 0 ? this.readStreamInt(streamData, dataPos, w[0]) : 1;
        const field2 = this.readStreamInt(streamData, dataPos + w[0], w[1]);
        const field3 = w[2] > 0 ? this.readStreamInt(streamData, dataPos + w[0] + w[1], w[2]) : 0;
        dataPos += rowSize;

        const objNum = startObj + i;
        if (type === 1 && !this.xrefOffsets.has(objNum)) {
          // type 1: uncompressed object, field2 = byte offset
          this.xrefOffsets.set(objNum, field2);
        } else if (type === 2 && !this.xrefOffsets.has(objNum)) {
          // type 2: compressed in object stream, field2 = stream obj num, field3 = index
          // Store negative to distinguish: -(streamObjNum * 1e6 + index)
          this.xrefOffsets.set(objNum, -(field2 * 1000000 + field3));
        }
      }
    }

    const prev = numVal(dictGet(obj, 'Prev'));
    if (prev !== undefined) {
      this.parseXrefAt(prev);
    }
  }

  private readStreamInt(data: Buffer, offset: number, size: number): number {
    let val = 0;
    for (let i = 0; i < size; i++) {
      val = (val << 8) | (data[offset + i] & 0xff);
    }
    return val;
  }

  // -- trailer root ---------------------------------------------------------

  private getTrailerRoot(): PdfRef {
    if (this.trailerDict) {
      const root = dictGet(this.trailerDict, 'Root');
      if (isRef(root)) return root;
    }
    throw new Error('Invalid PDF: cannot find Root in trailer');
  }

  // -- object resolution ----------------------------------------------------

  private resolveRef(ref: PdfObject | undefined): PdfObject {
    if (ref === undefined) return null;
    if (!isRef(ref)) return ref;
    return this.resolveObject(ref.objNum);
  }

  private resolveObject(objNum: number): PdfObject {
    if (this.objectCache.has(objNum)) return this.objectCache.get(objNum)!;

    const offset = this.xrefOffsets.get(objNum);
    if (offset === undefined) return null;

    let result: PdfObject;
    if (offset < 0) {
      // Object is inside an object stream
      const encoded = -offset;
      const streamObjNum = Math.floor(encoded / 1000000);
      const index = encoded % 1000000;
      result = this.getObjectFromStream(streamObjNum, index);
    } else {
      this.pos = offset;
      result = this.parseIndirectObject();
    }

    this.objectCache.set(objNum, result);
    return result;
  }

  private getObjectFromStream(streamObjNum: number, index: number): PdfObject {
    if (this.objStreamCache.has(streamObjNum)) {
      return this.objStreamCache.get(streamObjNum)!.get(index) ?? null;
    }

    const streamObj = this.resolveObject(streamObjNum);
    if (!isDict(streamObj)) return null;

    const n = numVal(dictGet(streamObj, 'N')) ?? 0;
    const first = numVal(dictGet(streamObj, 'First')) ?? 0;
    const data = this.getStreamData(streamObj);
    if (!data) return null;

    // Parse the header: pairs of (objNum, offset) × N
    const headerStr = data.subarray(0, first).toString('latin1');
    const headerParts = headerStr.trim().split(/\s+/).map(Number);

    const objMap = new Map<number, PdfObject>();
    const savedPos = this.pos;
    const savedBuf = this.buf;

    // Temporarily replace buffer with stream data (after header)
    this.buf = data;

    for (let i = 0; i < n; i++) {
      const objOffset = headerParts[i * 2 + 1];
      if (objOffset === undefined || isNaN(objOffset)) continue;
      this.pos = first + objOffset;
      try {
        const obj = this.parseObject();
        objMap.set(i, obj);
      } catch {
        // Skip malformed objects in stream
      }
    }

    this.buf = savedBuf;
    this.pos = savedPos;
    this.objStreamCache.set(streamObjNum, objMap);

    return objMap.get(index) ?? null;
  }

  // -- indirect object parsing ----------------------------------------------

  private parseIndirectObject(): PdfObject {
    this.skipWhitespace();
    // objNum gen obj
    this.parseNumber(); // skip objNum
    this.skipWhitespace();
    this.parseNumber(); // skip gen
    this.skipWhitespace();
    this.expect('obj');
    this.skipWhitespace();

    const obj = this.parseObject();

    this.skipWhitespace();

    // Check for stream
    if (isDict(obj) && this.matchKeyword('stream')) {
      this.skipStreamNewline();
      const length = this.resolveStreamLength(obj);
      const streamStart = this.pos;
      const streamEnd = streamStart + length;
      // Attach raw stream bounds to the dict
      (obj as any)._streamStart = streamStart;
      (obj as any)._streamEnd = streamEnd;
      this.pos = streamEnd;
    }

    return obj;
  }

  private resolveStreamLength(dict: PdfDict): number {
    const lenObj = dictGet(dict, 'Length');
    if (typeof lenObj === 'number') return lenObj;
    if (isRef(lenObj)) {
      const resolved = this.resolveObject(lenObj.objNum);
      if (typeof resolved === 'number') return resolved;
    }
    // Fallback: scan for endstream
    const marker = Buffer.from('endstream');
    const idx = this.buf.indexOf(marker, this.pos);
    if (idx === -1) return 0;
    // Trim trailing whitespace before endstream
    let end = idx;
    while (end > this.pos && (this.buf[end - 1] === 0x0a || this.buf[end - 1] === 0x0d)) {
      end--;
    }
    return end - this.pos;
  }

  // -- stream data extraction -----------------------------------------------

  private getStreamData(dict: PdfDict): Buffer | null {
    const start = (dict as any)._streamStart;
    const end = (dict as any)._streamEnd;
    if (start === undefined || end === undefined) return null;

    let data = this.buf.subarray(start, end);
    const filter = dictGet(dict, 'Filter');
    const filterName = isName(filter)
      ? filter.value
      : isArray(filter) && filter.items.length > 0 && isName(filter.items[0])
        ? filter.items[0].value
        : null;

    if (filterName === 'FlateDecode') {
      try {
        data = inflateSync(data);
      } catch {
        // Try with raw deflate (no header)
        try {
          data = inflateSync(data, { windowBits: -15 });
        } catch {
          return null;
        }
      }

      // Apply PNG predictor if specified in DecodeParms
      const decodeParms = this.resolveRef(dictGet(dict, 'DecodeParms'));
      if (isDict(decodeParms)) {
        const predictor = numVal(dictGet(decodeParms, 'Predictor')) ?? 1;
        if (predictor >= 10) {
          const columns = numVal(dictGet(decodeParms, 'Columns')) ?? 1;
          data = applyPngPredictor(data, columns);
        }
      }
    } else if (filterName && filterName !== 'FlateDecode') {
      // Unsupported filter — return null
      return null;
    }

    return data;
  }

  // -- object parser --------------------------------------------------------

  private parseObject(): PdfObject {
    this.skipWhitespace();
    const ch = this.peek();

    if (ch === 0x3c) {
      // '<'
      if (this.buf[this.pos + 1] === 0x3c) return this.parseDict();
      return this.parseHexString();
    }
    if (ch === 0x28) return this.parseLiteralString(); // '('
    if (ch === 0x2f) return this.parseName(); // '/'
    if (ch === 0x5b) return this.parseArray(); // '['
    if (ch === 0x74 || ch === 0x66) return this.parseBool(); // 't' or 'f'
    if (ch === 0x6e) { this.expect('null'); return null; } // 'n'

    // Number or indirect reference
    if (this.isDigit(ch) || ch === 0x2d || ch === 0x2b || ch === 0x2e) {
      return this.parseNumberOrRef();
    }

    // Unknown — skip a byte and try again
    this.pos++;
    return null;
  }

  private parseDict(): PdfDict {
    this.pos += 2; // skip '<<'
    const map = new Map<string, PdfObject>();

    while (this.pos < this.buf.length) {
      this.skipWhitespace();
      if (this.buf[this.pos] === 0x3e && this.buf[this.pos + 1] === 0x3e) {
        this.pos += 2;
        break;
      }
      const key = this.parseName();
      this.skipWhitespace();
      const value = this.parseObject();
      map.set(key.value, value);
    }

    return { type: 'dict', map };
  }

  private parseArray(): PdfArray {
    this.pos++; // skip '['
    const items: PdfObject[] = [];

    while (this.pos < this.buf.length) {
      this.skipWhitespace();
      if (this.buf[this.pos] === 0x5d) {
        this.pos++;
        break;
      }
      items.push(this.parseObject());
    }

    return { type: 'array', items };
  }

  private parseName(): PdfName {
    this.pos++; // skip '/'
    let name = '';
    while (this.pos < this.buf.length) {
      const ch = this.buf[this.pos];
      if (this.isWhitespace(ch) || this.isDelimiter(ch)) break;
      if (ch === 0x23 && this.pos + 2 < this.buf.length) {
        // hex escape #XX
        const hex = this.buf.toString('latin1', this.pos + 1, this.pos + 3);
        name += String.fromCharCode(parseInt(hex, 16));
        this.pos += 3;
      } else {
        name += String.fromCharCode(ch);
        this.pos++;
      }
    }
    return { type: 'name', value: name };
  }

  private parseLiteralString(): PdfString {
    this.pos++; // skip '('
    let depth = 1;
    const parts: number[] = [];

    while (this.pos < this.buf.length && depth > 0) {
      const ch = this.buf[this.pos];
      if (ch === 0x5c) {
        // backslash escape
        this.pos++;
        const esc = this.buf[this.pos];
        if (esc === 0x6e) { parts.push(0x0a); this.pos++; }
        else if (esc === 0x72) { parts.push(0x0d); this.pos++; }
        else if (esc === 0x74) { parts.push(0x09); this.pos++; }
        else if (esc === 0x62) { parts.push(0x08); this.pos++; }
        else if (esc === 0x66) { parts.push(0x0c); this.pos++; }
        else if (esc === 0x28) { parts.push(0x28); this.pos++; }
        else if (esc === 0x29) { parts.push(0x29); this.pos++; }
        else if (esc === 0x5c) { parts.push(0x5c); this.pos++; }
        else if (esc >= 0x30 && esc <= 0x37) {
          // Octal
          let octal = String.fromCharCode(esc);
          this.pos++;
          for (let i = 0; i < 2 && this.pos < this.buf.length; i++) {
            const next = this.buf[this.pos];
            if (next >= 0x30 && next <= 0x37) {
              octal += String.fromCharCode(next);
              this.pos++;
            } else break;
          }
          parts.push(parseInt(octal, 8));
        } else {
          parts.push(esc);
          this.pos++;
        }
      } else if (ch === 0x28) {
        depth++;
        parts.push(ch);
        this.pos++;
      } else if (ch === 0x29) {
        depth--;
        if (depth > 0) parts.push(ch);
        this.pos++;
      } else {
        parts.push(ch);
        this.pos++;
      }
    }

    return { type: 'string', value: Buffer.from(parts).toString('latin1') };
  }

  private parseHexString(): PdfString {
    this.pos++; // skip '<'
    let hex = '';
    while (this.pos < this.buf.length) {
      const ch = this.buf[this.pos];
      if (ch === 0x3e) { this.pos++; break; }
      if (!this.isWhitespace(ch)) hex += String.fromCharCode(ch);
      this.pos++;
    }
    if (hex.length % 2 !== 0) hex += '0';
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return { type: 'string', value: Buffer.from(bytes).toString('latin1') };
  }

  private parseNumberOrRef(): PdfObject {
    const savedPos = this.pos;
    const num = this.parseNumber();

    // Check if this is an indirect reference: num gen R
    const ws1 = this.pos;
    this.skipWhitespace();
    if (this.pos < this.buf.length && this.isDigit(this.buf[this.pos])) {
      const gen = this.parseNumber();
      this.skipWhitespace();
      if (this.pos < this.buf.length && this.buf[this.pos] === 0x52) {
        // 'R'
        this.pos++;
        return { type: 'ref', objNum: num, gen };
      }
      // Not a ref, backtrack
      this.pos = ws1;
    }

    return num;
  }

  private parseNumber(): number {
    let str = '';
    while (this.pos < this.buf.length) {
      const ch = this.buf[this.pos];
      if (this.isDigit(ch) || ch === 0x2d || ch === 0x2b || ch === 0x2e) {
        str += String.fromCharCode(ch);
        this.pos++;
      } else break;
    }
    return parseFloat(str) || 0;
  }

  private parseBool(): boolean {
    if (this.buf.toString('latin1', this.pos, this.pos + 4) === 'true') {
      this.pos += 4;
      return true;
    }
    this.pos += 5; // 'false'
    return false;
  }

  // -- page tree navigation -------------------------------------------------

  private collectPages(catalog: PdfDict): PdfDict[] {
    const pagesRef = dictGet(catalog, 'Pages');
    const pagesObj = this.resolveRef(pagesRef!);
    if (!isDict(pagesObj)) return [];
    return this.flattenPageTree(pagesObj);
  }

  private flattenPageTree(node: PdfDict): PdfDict[] {
    const nodeType = nameVal(dictGet(node, 'Type'));
    if (nodeType === 'Page') return [node];

    const kids = dictGet(node, 'Kids');
    if (!isArray(kids)) return [];

    const pages: PdfDict[] = [];
    for (const kidRef of kids.items) {
      const kid = this.resolveRef(kidRef);
      if (isDict(kid)) {
        pages.push(...this.flattenPageTree(kid));
      }
    }
    return pages;
  }

  // -- page extraction ------------------------------------------------------

  private extractPage(page: PdfDict): { text: string; fonts: string[]; images: boolean } {
    const fonts = this.collectPageFonts(page);
    const fontMap = this.buildFontMap(page);
    const hasImages = this.pageHasImages(page);

    const contents = dictGet(page, 'Contents');
    const streamData = this.getPageContentStream(contents);
    if (!streamData) return { text: '', fonts, images: hasImages };

    const text = this.extractTextFromContent(streamData, fontMap);
    return { text, fonts, images: hasImages };
  }

  private getPageContentStream(contents: PdfObject | undefined): Buffer | null {
    if (!contents) return null;

    if (isRef(contents)) {
      const obj = this.resolveObject(contents.objNum);
      if (isDict(obj)) return this.getStreamData(obj);
      if (isArray(obj)) return this.mergeContentStreams(obj);
      return null;
    }

    if (isArray(contents)) return this.mergeContentStreams(contents);
    if (isDict(contents)) return this.getStreamData(contents);
    return null;
  }

  private mergeContentStreams(arr: PdfArray): Buffer {
    const parts: Buffer[] = [];
    for (const item of arr.items) {
      const obj = isRef(item) ? this.resolveObject(item.objNum) : item;
      if (isDict(obj)) {
        const data = this.getStreamData(obj);
        if (data) parts.push(data);
      }
    }
    return Buffer.concat(parts);
  }

  // -- font handling --------------------------------------------------------

  private collectPageFonts(page: PdfDict): string[] {
    const fonts: string[] = [];
    const resources = this.resolveRef(dictGet(page, 'Resources') ?? null);
    if (!isDict(resources)) return fonts;

    const fontDict = this.resolveRef(dictGet(resources, 'Font') ?? null);
    if (!isDict(fontDict)) return fonts;

    for (const [, fontRef] of fontDict.map) {
      const fontObj = this.resolveRef(fontRef);
      if (!isDict(fontObj)) continue;

      const baseName = dictGet(fontObj, 'BaseFont');
      if (isName(baseName)) {
        // Clean up font name: remove subset prefix (ABCDEF+) and style suffix
        let name = baseName.value;
        const plusIdx = name.indexOf('+');
        if (plusIdx !== -1 && plusIdx <= 6) name = name.substring(plusIdx + 1);
        // Remove common style suffixes
        name = name.replace(/[,-](Bold|Italic|Regular|Light|Medium|Semibold|BoldItalic|Oblique)$/i, '');
        fonts.push(name);
      }
    }

    return fonts;
  }

  private buildFontMap(page: PdfDict): Map<string, ToUnicodeMap | null> {
    const map = new Map<string, ToUnicodeMap | null>();
    const resources = this.resolveRef(dictGet(page, 'Resources') ?? null);
    if (!isDict(resources)) return map;

    const fontDict = this.resolveRef(dictGet(resources, 'Font') ?? null);
    if (!isDict(fontDict)) return map;

    for (const [fontTag, fontRef] of fontDict.map) {
      const fontObj = this.resolveRef(fontRef);
      if (!isDict(fontObj)) continue;

      const toUnicodeRef = dictGet(fontObj, 'ToUnicode');
      if (toUnicodeRef) {
        const toUnicodeStream = this.resolveRef(toUnicodeRef);
        if (isDict(toUnicodeStream)) {
          const data = this.getStreamData(toUnicodeStream);
          if (data) {
            map.set(fontTag, parseCMap(data.toString('latin1')));
            continue;
          }
        }
      }

      // Check encoding
      const encoding = dictGet(fontObj, 'Encoding');
      if (isName(encoding) && encoding.value === 'Identity-H') {
        // Identity mapping with no ToUnicode — we'll try raw code points
        map.set(fontTag, null);
      } else {
        map.set(fontTag, null);
      }
    }

    return map;
  }

  // -- image detection ------------------------------------------------------

  private pageHasImages(page: PdfDict): boolean {
    const resources = this.resolveRef(dictGet(page, 'Resources') ?? null);
    if (!isDict(resources)) return false;

    const xobject = this.resolveRef(dictGet(resources, 'XObject') ?? null);
    if (!isDict(xobject)) return false;

    for (const [, ref] of xobject.map) {
      const obj = this.resolveRef(ref);
      if (isDict(obj) && nameVal(dictGet(obj, 'Subtype')) === 'Image') {
        return true;
      }
    }
    return false;
  }

  // -- text extraction from content stream ----------------------------------

  private extractTextFromContent(data: Buffer, fontMap: Map<string, ToUnicodeMap | null>): string {
    const str = data.toString('latin1');
    const lines: string[] = [];
    let currentLine = '';
    let currentFont: string | null = null;
    let currentCMap: ToUnicodeMap | null = null;
    let lastY: number | null = null;
    let lastX: number | null = null;

    const tokens = tokenizeContentStream(str);
    const stack: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === 'BT') {
        // Begin text — reset position tracking within text block
        lastY = null;
        lastX = null;
      } else if (token === 'ET') {
        // End text
      } else if (token === 'Tf') {
        // Set font: fontName fontSize Tf
        if (stack.length >= 2) {
          const fontSize = stack.pop()!;
          const fontName = stack.pop()!;
          const cleanName = fontName.startsWith('/') ? fontName.substring(1) : fontName;
          currentFont = cleanName;
          currentCMap = fontMap.get(cleanName) ?? null;
        }
      } else if (token === 'Td' || token === 'TD') {
        // Move text position: tx ty Td
        if (stack.length >= 2) {
          const ty = parseFloat(stack.pop()!);
          const tx = parseFloat(stack.pop()!);
          if (!isNaN(ty) && Math.abs(ty) > 0.5) {
            // Vertical movement — new line
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
              currentLine = '';
            }
          } else if (!isNaN(tx) && tx > 1) {
            // Horizontal gap — add space
            currentLine += ' ';
          }
        }
      } else if (token === 'Tm') {
        // Set text matrix: a b c d e f Tm
        if (stack.length >= 6) {
          const f = parseFloat(stack.pop()!); // y
          const e = parseFloat(stack.pop()!); // x
          stack.pop(); stack.pop(); stack.pop(); stack.pop();
          if (lastY !== null && Math.abs(f - lastY) > 1) {
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
              currentLine = '';
            }
          } else if (lastX !== null && e - lastX > 5) {
            currentLine += ' ';
          }
          lastY = f;
          lastX = e;
        }
      } else if (token === 'T*') {
        // Move to start of next line
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
      } else if (token === "'") {
        // Move to next line and show string
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        if (stack.length >= 1) {
          const s = stack.pop()!;
          currentLine += this.decodeTextString(s, currentCMap);
        }
      } else if (token === '"') {
        // Set spacing, move to next line, show string
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        if (stack.length >= 3) {
          const s = stack.pop()!;
          stack.pop(); // ac
          stack.pop(); // aw
          currentLine += this.decodeTextString(s, currentCMap);
        }
      } else if (token === 'Tj') {
        // Show string
        if (stack.length >= 1) {
          const s = stack.pop()!;
          currentLine += this.decodeTextString(s, currentCMap);
        }
      } else if (token === 'TJ') {
        // Show array of strings and positioning
        if (stack.length >= 1) {
          const arrayStr = stack.pop()!;
          currentLine += this.decodeTJArray(arrayStr, currentCMap);
        }
      } else {
        // It's an operand — push onto stack
        stack.push(token);
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines.join('\n');
  }

  private decodeTextString(raw: string, cmap: ToUnicodeMap | null): string {
    if (!raw) return '';

    // Raw is the content between ( ) or < > already extracted by tokenizer
    if (cmap) {
      return mapThroughCMap(raw, cmap);
    }

    // WinAnsiEncoding fallback — most common for non-CMap fonts
    return decodeWinAnsi(raw);
  }

  private decodeTJArray(raw: string, cmap: ToUnicodeMap | null): string {
    // raw looks like: [(str1) num (str2) num ...]
    let result = '';
    let i = 0;

    while (i < raw.length) {
      if (raw[i] === '(') {
        // Find matching close paren
        let depth = 1;
        let j = i + 1;
        while (j < raw.length && depth > 0) {
          if (raw[j] === '\\') { j += 2; continue; }
          if (raw[j] === '(') depth++;
          if (raw[j] === ')') depth--;
          j++;
        }
        const str = raw.substring(i + 1, j - 1);
        result += this.decodeTextString(unescapeStringContent(str), cmap);
        i = j;
      } else if (raw[i] === '<') {
        const end = raw.indexOf('>', i);
        if (end === -1) break;
        const hex = raw.substring(i + 1, end);
        const bytes = hexToBytes(hex);
        result += this.decodeTextString(bytes, cmap);
        i = end + 1;
      } else if (raw[i] === '-' || raw[i] === '.' || (raw[i] >= '0' && raw[i] <= '9')) {
        // Numeric adjustment — large negative values insert space
        let numStr = '';
        while (i < raw.length && (raw[i] === '-' || raw[i] === '.' || (raw[i] >= '0' && raw[i] <= '9'))) {
          numStr += raw[i];
          i++;
        }
        const num = parseFloat(numStr);
        if (!isNaN(num) && num < -100) {
          result += ' ';
        }
      } else {
        i++;
      }
    }

    return result;
  }

  // -- metadata extraction --------------------------------------------------

  private extractMetadata(): Record<string, string> {
    const metadata: Record<string, string> = {};
    if (!this.trailerDict) return metadata;

    const infoRef = dictGet(this.trailerDict, 'Info');
    if (!infoRef) return metadata;

    const info = this.resolveRef(infoRef);
    if (!isDict(info)) return metadata;

    const keys = ['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer'];
    for (const key of keys) {
      const val = dictGet(info, key);
      if (isString(val) && val.value.trim()) {
        metadata[key] = decodePdfString(val.value);
      }
    }

    return metadata;
  }

  // -- low-level scanning ---------------------------------------------------

  private peek(): number {
    return this.buf[this.pos] ?? 0;
  }

  private skipWhitespace() {
    while (this.pos < this.buf.length) {
      const ch = this.buf[this.pos];
      if (ch === 0x25) {
        // '%' comment — skip to EOL
        while (this.pos < this.buf.length && this.buf[this.pos] !== 0x0a && this.buf[this.pos] !== 0x0d) {
          this.pos++;
        }
        continue;
      }
      if (!this.isWhitespace(ch)) break;
      this.pos++;
    }
  }

  private skipStreamNewline() {
    // After "stream" keyword, skip single \r\n or \n
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0d) this.pos++;
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0a) this.pos++;
  }

  private expect(keyword: string) {
    const actual = this.buf.toString('latin1', this.pos, this.pos + keyword.length);
    if (actual !== keyword) throw new Error(`Expected '${keyword}' at ${this.pos}, got '${actual}'`);
    this.pos += keyword.length;
  }

  private matchKeyword(keyword: string): boolean {
    if (this.buf.toString('latin1', this.pos, this.pos + keyword.length) === keyword) {
      this.pos += keyword.length;
      return true;
    }
    return false;
  }

  private skipTo(keyword: string) {
    const idx = this.buf.indexOf(keyword, this.pos, 'latin1');
    if (idx === -1) throw new Error(`Could not find '${keyword}'`);
    this.pos = idx;
  }

  private peekLine(): string {
    let end = this.pos;
    while (end < this.buf.length && this.buf[end] !== 0x0a && this.buf[end] !== 0x0d) end++;
    return this.buf.toString('latin1', this.pos, end);
  }

  private advanceLine() {
    while (this.pos < this.buf.length && this.buf[this.pos] !== 0x0a && this.buf[this.pos] !== 0x0d) this.pos++;
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0d) this.pos++;
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0a) this.pos++;
  }

  private readFixedLine(maxLen: number): string {
    const start = this.pos;
    let end = start;
    while (end < this.buf.length && end - start < maxLen && this.buf[end] !== 0x0a && this.buf[end] !== 0x0d) end++;
    const line = this.buf.toString('latin1', start, end);
    this.pos = end;
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0d) this.pos++;
    if (this.pos < this.buf.length && this.buf[this.pos] === 0x0a) this.pos++;
    return line;
  }

  private isWhitespace(ch: number): boolean {
    return ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d || ch === 0x0c || ch === 0x00;
  }

  private isDelimiter(ch: number): boolean {
    return ch === 0x28 || ch === 0x29 || ch === 0x3c || ch === 0x3e
      || ch === 0x5b || ch === 0x5d || ch === 0x7b || ch === 0x7d
      || ch === 0x2f || ch === 0x25;
  }

  private isDigit(ch: number): boolean {
    return ch >= 0x30 && ch <= 0x39;
  }
}

// ---------------------------------------------------------------------------
// CMap (ToUnicode) parser
// ---------------------------------------------------------------------------

type ToUnicodeMap = {
  bfChars: Map<number, string>;
  bfRanges: Array<{ start: number; end: number; offset: string[] | number }>;
};

function parseCMap(cmap: string): ToUnicodeMap {
  const bfChars = new Map<number, string>();
  const bfRanges: ToUnicodeMap['bfRanges'] = [];

  // Parse bfchar sections
  const charRegex = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
  const charSection = cmap.match(/beginbfchar[\s\S]*?endbfchar/g);
  if (charSection) {
    for (const section of charSection) {
      let m;
      while ((m = charRegex.exec(section)) !== null) {
        const code = parseInt(m[1], 16);
        const unicode = hexToUnicode(m[2]);
        bfChars.set(code, unicode);
      }
    }
  }

  // Parse bfrange sections
  const rangeSection = cmap.match(/beginbfrange[\s\S]*?endbfrange/g);
  if (rangeSection) {
    for (const section of rangeSection) {
      const rangeRegex = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([^\]]+)\])/g;
      let m;
      while ((m = rangeRegex.exec(section)) !== null) {
        const start = parseInt(m[1], 16);
        const end = parseInt(m[2], 16);
        if (m[3]) {
          // Single start value — increments
          bfRanges.push({ start, end, offset: parseInt(m[3], 16) });
        } else if (m[4]) {
          // Array of values
          const vals = m[4].match(/<([0-9A-Fa-f]+)>/g);
          if (vals) {
            bfRanges.push({
              start, end,
              offset: vals.map((v) => hexToUnicode(v.replace(/[<>]/g, ''))),
            });
          }
        }
      }
    }
  }

  return { bfChars, bfRanges };
}

function mapThroughCMap(raw: string, cmap: ToUnicodeMap): string {
  let result = '';

  // Try 2-byte codes first (common for CIDFonts)
  for (let i = 0; i < raw.length; i++) {
    let code: number;
    let matched = false;

    // Try 2-byte
    if (i + 1 < raw.length) {
      code = (raw.charCodeAt(i) << 8) | raw.charCodeAt(i + 1);
      const ch = cmap.bfChars.get(code);
      if (ch !== undefined) {
        result += ch;
        i++; // skip second byte
        matched = true;
        continue;
      }
      // Check ranges
      for (const range of cmap.bfRanges) {
        if (code >= range.start && code <= range.end) {
          if (typeof range.offset === 'number') {
            result += String.fromCodePoint(range.offset + (code - range.start));
          } else {
            const idx = code - range.start;
            if (idx < range.offset.length) result += range.offset[idx];
          }
          i++;
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    // Try 1-byte
    code = raw.charCodeAt(i);
    const ch = cmap.bfChars.get(code);
    if (ch !== undefined) {
      result += ch;
      continue;
    }

    // Range check for 1-byte
    for (const range of cmap.bfRanges) {
      if (code >= range.start && code <= range.end) {
        if (typeof range.offset === 'number') {
          result += String.fromCodePoint(range.offset + (code - range.start));
        } else {
          const idx = code - range.start;
          if (idx < range.offset.length) result += range.offset[idx];
        }
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Fallback
    if (code >= 0x20 && code < 0x7f) {
      result += String.fromCharCode(code);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// WinAnsiEncoding
// ---------------------------------------------------------------------------

const WIN_ANSI_MAP: Record<number, number> = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
  0x9E: 0x017E, 0x9F: 0x0178,
};

function decodeWinAnsi(raw: string): string {
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    const mapped = WIN_ANSI_MAP[code];
    result += mapped ? String.fromCodePoint(mapped) : String.fromCharCode(code);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Content stream tokenizer
// ---------------------------------------------------------------------------

function tokenizeContentStream(str: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < str.length) {
    // Skip whitespace
    while (i < str.length && isCSWhitespace(str.charCodeAt(i))) i++;
    if (i >= str.length) break;

    const ch = str.charCodeAt(i);

    // Comment
    if (ch === 0x25) {
      while (i < str.length && str.charCodeAt(i) !== 0x0a) i++;
      continue;
    }

    // Literal string
    if (ch === 0x28) {
      let depth = 1;
      let j = i + 1;
      let s = '';
      while (j < str.length && depth > 0) {
        if (str[j] === '\\') {
          s += str[j] + (str[j + 1] ?? '');
          j += 2;
          continue;
        }
        if (str[j] === '(') depth++;
        if (str[j] === ')') { depth--; if (depth === 0) { j++; break; } }
        s += str[j];
        j++;
      }
      tokens.push(unescapeStringContent(s));
      i = j;
      continue;
    }

    // Hex string
    if (ch === 0x3c && i + 1 < str.length && str.charCodeAt(i + 1) !== 0x3c) {
      const end = str.indexOf('>', i + 1);
      const hex = str.substring(i + 1, end === -1 ? str.length : end);
      tokens.push(hexToBytes(hex.replace(/\s/g, '')));
      i = end === -1 ? str.length : end + 1;
      continue;
    }

    // Array (for TJ)
    if (ch === 0x5b) {
      let depth = 1;
      let j = i + 1;
      while (j < str.length && depth > 0) {
        if (str[j] === '[') depth++;
        else if (str[j] === ']') depth--;
        j++;
      }
      tokens.push(str.substring(i + 1, j - 1));
      i = j;
      continue;
    }

    // Dict markers
    if (ch === 0x3c && i + 1 < str.length && str.charCodeAt(i + 1) === 0x3c) {
      tokens.push('<<');
      i += 2;
      continue;
    }
    if (ch === 0x3e && i + 1 < str.length && str.charCodeAt(i + 1) === 0x3e) {
      tokens.push('>>');
      i += 2;
      continue;
    }

    // Name
    if (ch === 0x2f) {
      let j = i + 1;
      while (j < str.length && !isCSWhitespace(str.charCodeAt(j)) && !isCSDelimiter(str.charCodeAt(j))) j++;
      tokens.push(str.substring(i, j));
      i = j;
      continue;
    }

    // Number or keyword
    {
      let j = i;
      while (j < str.length && !isCSWhitespace(str.charCodeAt(j)) && !isCSDelimiter(str.charCodeAt(j))) j++;
      if (j > i) {
        tokens.push(str.substring(i, j));
      }
      i = j;
    }
  }

  return tokens;
}

function isCSWhitespace(ch: number): boolean {
  return ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d || ch === 0x0c || ch === 0x00;
}

function isCSDelimiter(ch: number): boolean {
  return ch === 0x28 || ch === 0x29 || ch === 0x3c || ch === 0x3e
    || ch === 0x5b || ch === 0x5d || ch === 0x2f || ch === 0x25;
}

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

function hexToUnicode(hex: string): string {
  let result = '';
  for (let i = 0; i < hex.length; i += 4) {
    const chunk = hex.substring(i, i + 4).padEnd(4, '0');
    result += String.fromCodePoint(parseInt(chunk, 16));
  }
  return result;
}

function hexToBytes(hex: string): string {
  if (hex.length % 2 !== 0) hex += '0';
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return result;
}

function unescapeStringContent(s: string): string {
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '\\') {
      i++;
      if (i >= s.length) break;
      switch (s[i]) {
        case 'n': result += '\n'; break;
        case 'r': result += '\r'; break;
        case 't': result += '\t'; break;
        case 'b': result += '\b'; break;
        case 'f': result += '\f'; break;
        case '(': result += '('; break;
        case ')': result += ')'; break;
        case '\\': result += '\\'; break;
        default:
          if (s[i] >= '0' && s[i] <= '7') {
            let octal = s[i];
            if (i + 1 < s.length && s[i + 1] >= '0' && s[i + 1] <= '7') { octal += s[++i]; }
            if (i + 1 < s.length && s[i + 1] >= '0' && s[i + 1] <= '7') { octal += s[++i]; }
            result += String.fromCharCode(parseInt(octal, 8));
          } else {
            result += s[i];
          }
      }
      i++;
    } else {
      result += s[i];
      i++;
    }
  }
  return result;
}

function decodePdfString(raw: string): string {
  // Handle UTF-16BE BOM
  if (raw.charCodeAt(0) === 0xFE && raw.charCodeAt(1) === 0xFF) {
    let result = '';
    for (let i = 2; i + 1 < raw.length; i += 2) {
      result += String.fromCodePoint((raw.charCodeAt(i) << 8) | raw.charCodeAt(i + 1));
    }
    return result;
  }
  // Otherwise treat as PDFDocEncoding (≈ Latin1 for printable chars)
  return decodeWinAnsi(raw);
}

// ---------------------------------------------------------------------------
// PNG predictor (used by FlateDecode with DecodeParms)
// ---------------------------------------------------------------------------

function applyPngPredictor(data: Buffer, columns: number): Buffer {
  const rowSize = columns; // bytes per row (without the filter byte)
  const stride = rowSize + 1; // each row has 1 filter byte + columns bytes
  const rows = Math.floor(data.length / stride);
  const output = Buffer.alloc(rows * rowSize);
  const prevRow = Buffer.alloc(rowSize);

  for (let r = 0; r < rows; r++) {
    const filterByte = data[r * stride];
    const srcOffset = r * stride + 1;
    const dstOffset = r * rowSize;

    switch (filterByte) {
      case 0: // None
        data.copy(output, dstOffset, srcOffset, srcOffset + rowSize);
        break;
      case 1: // Sub
        for (let i = 0; i < rowSize; i++) {
          const left = i > 0 ? output[dstOffset + i - 1] : 0;
          output[dstOffset + i] = (data[srcOffset + i] + left) & 0xff;
        }
        break;
      case 2: // Up
        for (let i = 0; i < rowSize; i++) {
          output[dstOffset + i] = (data[srcOffset + i] + prevRow[i]) & 0xff;
        }
        break;
      case 3: // Average
        for (let i = 0; i < rowSize; i++) {
          const left = i > 0 ? output[dstOffset + i - 1] : 0;
          output[dstOffset + i] = (data[srcOffset + i] + ((left + prevRow[i]) >> 1)) & 0xff;
        }
        break;
      case 4: // Paeth
        for (let i = 0; i < rowSize; i++) {
          const a = i > 0 ? output[dstOffset + i - 1] : 0; // left
          const b = prevRow[i]; // above
          const c = i > 0 ? prevRow[i - 1] : 0; // upper-left
          output[dstOffset + i] = (data[srcOffset + i] + paethPredictor(a, b, c)) & 0xff;
        }
        break;
      default:
        // Unknown filter — copy raw
        data.copy(output, dstOffset, srcOffset, srcOffset + rowSize);
    }

    output.copy(prevRow, 0, dstOffset, dstOffset + rowSize);
  }

  return output;
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function readPdf(buffer: Buffer): PdfReadResult {
  const parser = new PdfParser(buffer);
  return parser.read();
}
