"use client";

import type { ChangeEvent } from "react";

type AccountFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  errors?: string[];
  required?: boolean;
};

const inputClassName =
  "mt-1.5 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong";

export function AccountField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  value,
  onChange,
  errors,
  required,
}: AccountFieldProps) {
  const describedBy = errors?.length ? `${id}-error` : undefined;
  const controlled = value !== undefined;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[12.5px] font-medium text-gs-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className={inputClassName}
        {...(controlled
          ? {
              value,
              onChange: (event: ChangeEvent<HTMLInputElement>) =>
                onChange?.(event.target.value),
            }
          : { defaultValue })}
      />
      {errors?.length ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-gs-critical">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
