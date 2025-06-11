import React, {
  ChangeEventHandler,
  FocusEventHandler,
  FormEventHandler,
  useState,
} from "react";
import styles from "./styles.module.scss";
import { FieldConfig } from "../../../types/auth";

export interface FormProps {
  title: string;
  subtitle: string;
  fields: FieldConfig;
  submitLabel: string;
  submitDisabled?: boolean;
  onSubmit?: (fields: Record<string, string>) => any;
  submissionError?: string;
}

const getFieldState = (fields: FieldConfig) => {
  const fieldMapping: Record<string, string> = {};
  for (let fieldName of Object.keys(fields)) {
    fieldMapping[fieldName] = "";
  }
  return fieldMapping;
};
export const Form: React.FC<FormProps> = (props) => {
  const {
    title,
    subtitle,
    fields,
    submitLabel,
    submitDisabled,
    submissionError,
    onSubmit: onSubmitProp,
  } = props;
  const [fieldValues, setFieldValues] = useState(getFieldState(fields));
  const [errors, setErrors] = useState(getFieldState(fields));

  const onChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { target } = ev;
    const { name, value } = target;
    setFieldValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onBlur: FocusEventHandler<HTMLInputElement> = (ev) => {
    const { target } = ev;
    const { name, value } = target;
    const { validator } = fields[name];
    if (!fields[name]) {
      return;
    }
    setFieldValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validator(value),
    }));
  };
  const errorsExist = Object.values(errors).some((x) => !!x);
  const onSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    if (errorsExist) {
      return;
    }
    onSubmitProp && onSubmitProp(fieldValues);
  };
  return (
    <>
      <div id={styles.header}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <form onSubmit={onSubmit} id={styles.form}>
        <div id={styles.fields_container}>
          {Object.entries(fields).map(([fieldName, field]) => {
            const { label, type, required, placeholder } = field;
            const id = `form_${fieldName}`;
            return (
              <div className={styles.form_group}>
                <label htmlFor={id}>{label}</label>
                <input
                  type={type}
                  id={id}
                  name={fieldName}
                  value={fieldValues[fieldName] || ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={placeholder}
                  required={required}
                  data-error={!!errors[fieldName]}
                />
                <p className={styles.error_label}>{errors[fieldName] ?? ""}</p>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          id={styles.submit}
          disabled={errorsExist || submitDisabled}
        >
          {submitLabel}
        </button>
      </form>
      <p id={styles.submission_error} data-visible={!!submissionError}>
        {submissionError || "p"}
      </p>
    </>
  );
};
