const inputClassName =
  "mt-2 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong";

const labelClassName =
  "inline-block rounded-[10px] bg-gs-bg px-2.5 py-1 text-base font-normal text-gs-text md:text-xl";

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  errors?: string[];
  value?: string;
  onChange?: (value: string) => void;
};

export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  errors,
  value,
  onChange,
}: FieldProps) {
  const describedBy = errors?.length ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className={inputClassName}
        value={value}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : undefined
        }
      />
      {errors?.length ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-gs-critical">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-lg items-center justify-center px-4 py-10 md:py-16">
      <div className="w-full rounded-[20px] bg-gs-surface p-6 md:p-10">{children}</div>
    </div>
  );
}
