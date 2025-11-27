import * as React from "react";

import { cn } from "@/lib/utils";
import { ValidateKind, getInputMode, getPattern, sanitizeValue } from "@/lib/validators";

type InputProps = React.ComponentProps<"input"> & {
  validate?: ValidateKind; 
  onValidationChange?: (valid: boolean) => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, validate, onChange, onPaste, onKeyDown, onValidationChange, value, defaultValue, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const reportValidity = React.useCallback(
      (v: string) => {
        if (onValidationChange) onValidationChange(v.length === 0 || validate == null ? true : !!sanitizeValue(v, validate) && !!getPattern(validate) ? new RegExp(getPattern(validate)!, validate === "letters" || validate === "alphanumeric" ? "u" : undefined).test(v) : true);
      },
      [onValidationChange, validate],
    );

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!validate) {
        onChange?.(e);
        return;
      }
      const cleaned = sanitizeValue(e.target.value, validate);
      if (cleaned !== e.target.value) {
        e.target.value = cleaned;
      }
      onChange?.(e);
      reportValidity(e.target.value);
    };

    const blockInvalid = (text: string) => {
      if (!validate) return false;
      const before = inputRef.current?.value ?? "";
      
      const next = sanitizeValue(before + text, validate);
      return before + text !== next; 
    };

    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
      if (!validate) return onPaste?.(e);
      const text = e.clipboardData.getData("text");
      if (blockInvalid(text)) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        const next = sanitizeValue((target.value ?? "") + text, validate);
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const replaced = target.value.slice(0, start) + next.slice(-Math.min(next.length, text.length)) + target.value.slice(end);
        target.value = replaced;
        const ev = new Event("input", { bubbles: true });
        target.dispatchEvent(ev);
      } else {
        onPaste?.(e);
      }
    };

    const mode = validate ? getInputMode(validate) : undefined;
    const pattern = validate ? getPattern(validate) : undefined;

    return (
      <input
        ref={(node) => {
          inputRef.current = node;
        }}
        type={type}
        value={value}
        defaultValue={defaultValue}
        inputMode={mode}
        pattern={pattern}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (!validate) return onKeyDown?.(e);
          const controlKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "Enter",
            "Escape",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ];
          if (controlKeys.includes(e.key)) return onKeyDown?.(e);

          
          if ((validate === "number" || validate === "integer") && ["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
            return;
          }
          if (validate === "integer") {
            if (e.key.length === 1 && !/\d/.test(e.key)) {
              e.preventDefault();
              return;
            }
          }
          if (validate === "number") {
            const current = inputRef.current?.value ?? "";
            if (e.key.length === 1 && !/\d|\.|,/.test(e.key)) {
              e.preventDefault();
              return;
            }
            
            if ((e.key === "." || e.key === ",") && /[\.,]/.test(current)) {
              e.preventDefault();
              return;
            }
          }
          onKeyDown?.(e);
        }}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
