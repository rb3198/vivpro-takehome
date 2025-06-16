import React, { useContext, useState } from "react";
import styles from "./styles.module.scss";
import { Field } from "../../../types/auth";
import { Form } from "../form";
import { validatePassword, validateUsername } from "../field_validations";
import { GlobalDataContext } from "../../../contexts/global_data_context";
import { useNavigate } from "react-router-dom";

type LoginProps = {};

type LoginFields = {
  username: Field;
  password: Field;
};

export const Login: React.FC<LoginProps> = () => {
  const [submissionError, setSubmissionError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(GlobalDataContext);
  const navigate = useNavigate();

  const onSubmit = async (fields: Record<keyof LoginFields, string>) => {
    const { username, password } = fields;
    setLoading(true);
    await login(username, password, () => navigate("/"), setSubmissionError);
    setLoading(false);
  };
  const fields: LoginFields = {
    username: {
      type: "text",
      label: "Username",
      required: true,
      placeholder: "Enter your username",
      validator: validateUsername,
    },
    password: {
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      required: true,
      validator: validatePassword,
    },
  };
  return (
    <div id={styles.container}>
      <Form
        formName="login"
        title="Welcome Back"
        subtitle="Please sign in to your account"
        submitLabel={loading ? "Signing In..." : "Sign In"}
        fields={fields}
        onSubmit={onSubmit}
        submitDisabled={loading}
        submissionError={submissionError}
      />
    </div>
  );
};
