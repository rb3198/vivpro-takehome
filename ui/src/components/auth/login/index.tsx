import React, { useContext, useState } from "react";
import styles from "./styles.module.scss";
import { Field } from "../../../types/auth";
import { useFetch } from "../../../hooks/useFetch";
import { Form } from "../form";
import { SESSION_ENDPOINT } from "../../../constants/endpoints";
import { validatePassword, validateUsername } from "../field_validations";
import { GlobalDataContext } from "../../../contexts/global_data_context";
import { useNavigate } from "react-router-dom";

type LoginProps = {};

type LoginFields = {
  username: Field;
  password: Field;
};

export const Login: React.FC<LoginProps> = () => {
  const [submissionError, setsubmissionError] = useState("");
  const { setUser } = useContext(GlobalDataContext);
  const navigate = useNavigate();

  const { fetchResult: fetch, loading } = useFetch<boolean>();
  const onSubmit = async (fields: Record<keyof LoginFields, string>) => {
    try {
      const res = await fetch(SESSION_ENDPOINT, "post", JSON.stringify(fields));
      if (res.ok) {
        setUser({
          username: fields.username,
          name: "",
        });
        navigate("/");
      } else {
        if (res.headers.get("Content-Type") === "application/json") {
          const error = await res.json();
          "message" in error && setsubmissionError(error.message);
        } else {
          setsubmissionError(
            res.status === 401 ? "Invalid Credentials" : "An unknown error"
          );
        }
      }
    } catch (error) {
      if (typeof error === "object" && error) {
        const message =
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Something went wrong, Please try again.";
        setsubmissionError(message);
      }
    }
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
