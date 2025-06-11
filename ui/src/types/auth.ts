import { HTMLInputTypeAttribute } from "react";

export type RegistrationData = {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export type LoginData = Omit<RegistrationData, "name" | "confirmPassword">;

export type Field = {
  label: string;
  type: HTMLInputTypeAttribute;
  required?: boolean;
  placeholder: string;
  validator: (value: any) => string;
};

export type FieldConfig = Record<string, Field>;
