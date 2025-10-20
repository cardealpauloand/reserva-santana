export type ValidateKind =
  | "email"
  | "integer"
  | "number"
  | "date"
  | "cep"
  | "phone"
  | "state"
  | "letters"
  | "alphanumeric";

// Basic validators/sanitizers tailored for BR use cases (CEP, phone, UF)
export function sanitizeValue(value: string, kind?: ValidateKind): string {
  if (!kind) return value;
  switch (kind) {
    case "integer": {
      const digits = value.replace(/\D+/g, "");
      return digits;
    }
    case "number": {
      // Allow digits and one decimal separator (dot or comma -> dot)
      let v = value.replace(/,/g, ".");
      // Remove invalid chars
      v = v.replace(/[^0-9.]/g, "");
      // Keep only first dot
      const firstDot = v.indexOf(".");
      if (firstDot !== -1) {
        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
      }
      return v;
    }
    case "email": {
      // Trim spaces and lowercase, remove illegal spaces
      return value.trim().toLowerCase().replace(/\s+/g, "");
    }
    case "date": {
      // Allow digits and separators - or /
      return value.replace(/[^0-9/\-]/g, "");
    }
    case "cep": {
      // Only 8 digits
      return value.replace(/\D+/g, "").slice(0, 8);
    }
    case "phone": {
      // BR phone: 10-11 digits, cap at 11
      return value.replace(/\D+/g, "").slice(0, 11);
    }
    case "state": {
      // UF: two letters only
      return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
    }
    case "letters": {
      // Letters (including accented) and spaces
      return value.replace(/[^\p{L} ]+/gu, "");
    }
    case "alphanumeric": {
      return value.replace(/[^\p{L}0-9 ]+/gu, "");
    }
    default:
      return value;
  }
}

import type React from "react";

export function getInputMode(kind?: ValidateKind): React.HTMLAttributes<HTMLInputElement>["inputMode"] {
  switch (kind) {
    case "integer":
    case "cep":
    case "phone":
      return "numeric";
    case "number":
      return "decimal";
    case "email":
      return "email";
    default:
      return undefined;
  }
}

export function getPattern(kind?: ValidateKind): string | undefined {
  switch (kind) {
    case "integer":
      return "^\\d+$";
    case "number":
      return "^\\d+(\\.\\d+)?$";
    case "email":
      // Simple but safe email pattern
      return "^[^\s@]+@[^\s@]+\\.[^\s@]+$";
    case "date":
      // Accept dd/mm/yyyy or yyyy-mm-dd
      return "^(?:\\d{2}/\\d{2}/\\d{4}|\\d{4}-\\d{2}-\\d{2})$";
    case "cep":
      return "^\\d{8}$";
    case "phone":
      return "^\\d{10,11}$";
    case "state":
      return "^(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$";
    case "letters":
      return "^[\\p{L} ]+$";
    case "alphanumeric":
      return "^[\\p{L}0-9 ]+$";
    default:
      return undefined;
  }
}

export function isValid(value: string, kind?: ValidateKind): boolean {
  if (!kind) return true;
  const pattern = getPattern(kind);
  if (!pattern) return true;
  const re = new RegExp(pattern, kind === "letters" || kind === "alphanumeric" ? "u" : undefined);
  return re.test(value);
}
