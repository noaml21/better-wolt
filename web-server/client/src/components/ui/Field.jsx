import { useId } from 'react';
import './Field.css';

/* A labelled control. The label is always tied to the input, hints and
   errors are tied with aria-describedby, and the error is announced
   (spec §7). Use `as="textarea"` for long text. */

export default function Field({
  label,
  hint,
  error,
  required = false,
  as = 'input',
  id,
  className = '',
  children,
  ...rest
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  const Control = as;

  return (
    <div className={`bw-field ${error ? 'bw-field--invalid' : ''} ${className}`}>
      <label className="bw-field__label" htmlFor={fieldId}>
        {label}
        {required && (
          <span className="bw-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children || (
        <Control
          id={fieldId}
          className="bw-field__control"
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
      )}

      {hint && !error && (
        <p className="bw-field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="bw-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioGroup({ label, name, options, value, onChange, className = '' }) {
  return (
    <fieldset className={`bw-radio-group ${className}`}>
      <legend className="bw-field__label">{label}</legend>

      <div className="bw-radio-group__options">
        {options.map((option) => (
          <label
            key={option.value}
            className={`bw-radio ${value === option.value ? 'bw-radio--selected' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
            />
            <span className="bw-radio__text">
              <span className="bw-radio__title">{option.label}</span>
              {option.description && (
                <span className="bw-radio__description">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
