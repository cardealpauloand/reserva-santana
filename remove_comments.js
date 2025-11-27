#!/usr/bin/env node




const fs = require('fs');
const path = require('path');

const EXTS = new Set(['.php', '.js', '.ts', '.tsx', '.css', '.scss']);
const EXCLUDE_DIRS = new Set(['node_modules', 'vendor', '.git', 'dist', 'build', 'storage']);

function stripComments(code, ext) {
  let out = '';
  let i = 0;
  const len = code.length;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inRegex = false; 
  let inBlock = false;
  let inLine = false;
  let escape = false;
  let lastChar = '';

  const isJsLike = ext === '.js' || ext === '.ts' || ext === '.tsx';
  const isPhp = ext === '.php';

  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : '';

    
    if (inLine) {
      if (ch === '\n') {
        inLine = false;
        out += ch; 
      }
      i++;
      continue;
    }

    
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    
    if (!inSingle && !inDouble && !inTemplate && !inRegex) {
      
      if (ch === '/' && next === '/') {
        inLine = true;
        i += 2;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlock = true;
        i += 2;
        continue;
      }
      if (isPhp && ch === '#') { 
        inLine = true;
        i++;
        continue;
      }
    }

    if (!inSingle && !inDouble && !inTemplate && !inRegex) {
      if (ch === '\'' ) { inSingle = true; out += ch; i++; escape = false; lastChar = ch; continue; }
      if (ch === '"') { inDouble = true; out += ch; i++; escape = false; lastChar = ch; continue; }
      if (isJsLike && ch === '`') { inTemplate = true; out += ch; i++; escape = false; lastChar = ch; continue; }
      
      if (isJsLike && ch === '/' && next && !'\n'.includes(next)) {
        
        const prevNonSpace = out.trim().slice(-1);
        if (!prevNonSpace || /[\(\{\[=;,!?:&|*/+-]/.test(prevNonSpace)) {
          
          inRegex = true; out += ch; i++; escape = false; lastChar = ch; continue;
        }
      }
    } else {
      
      if (inSingle) {
        out += ch;
        if (!escape && ch === '\'') { inSingle = false; }
        escape = (!escape && ch === '\\');
        i++; lastChar = ch; continue;
      }
      if (inDouble) {
        out += ch;
        if (!escape && ch === '"') { inDouble = false; }
        escape = (!escape && ch === '\\');
        i++; lastChar = ch; continue;
      }
      if (inTemplate) {
        out += ch;
        if (!escape && ch === '`') { inTemplate = false; }
        escape = (!escape && ch === '\\');
        i++; lastChar = ch; continue;
      }
      if (inRegex) {
        out += ch;
        if (!escape && ch === '/') { inRegex = false; }
        escape = (!escape && ch === '\\');
        i++; lastChar = ch; continue;
      }
    }

    
    out += ch;
    escape = (ch === '\\' && !escape);
    lastChar = ch;
    i++;
  }

  return out;
}

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!EXTS.has(ext)) continue;
      let code = fs.readFileSync(full, 'utf8');
      const cleaned = stripComments(code, ext);
      if (cleaned !== code) {
        fs.writeFileSync(full, cleaned, 'utf8');
        console.log('Stripped comments:', full);
      }
    }
  }
}

processDir('.');
console.log('Comment removal completed.');
