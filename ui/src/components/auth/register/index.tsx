import React, { useContext, useState } from "react";
import styles from "./styles.module.scss";
import { Field } from "../../../types/auth";
import { useFetch } from "../../../hooks/useFetch";
import { Form } from "../form";
import { LOGIN_ENDPOINT, USER_ENDPOINT } from "../../../constants/endpoints";
import {
  validateName,
  validatePassword,
  validateUsername,
} from "../field_validations";
import { GlobalDataContext } from "../../../contexts/global_data_context";
import { useNavigate } from "react-router-dom";

type RegisterProps = {};

type RegisterFields = {
  username: Field;
  password: Field;
  name: Field;
};

export const Register: React.FC<RegisterProps> = () => {
  const { fetchResult: fetch, loading } = useFetch<boolean>();
  const navigate = useNavigate();
  const [submissionError, setSubmissionError] = useState("");
  const { openNotifPopup, setUser } = useContext(GlobalDataContext);
  const onSubmit = async (fields: Record<keyof RegisterFields, string>) => {
    let outerRes = undefined;
    try {
      const res = await fetch(USER_ENDPOINT, "post", JSON.stringify(fields));
      if (res.ok) {
        outerRes = res;
        // Registration Successful, proceed to login.
        const loginRes = await fetch(
          LOGIN_ENDPOINT,
          "post",
          JSON.stringify({
            username: fields.username,
            password: fields.password,
          })
        );
        if (loginRes.ok) {
          // Successful login, proceed to the main page.
          setUser({
            name: fields.name,
            username: fields.username,
          });
          openNotifPopup({
            message: "Successfully Registered & Logged In!",
            duration: 5000,
            visible: true,
          });
          navigate("/");
          return;
        }
        setSubmissionError(
          "Successfully registered but failed to login. Please try again by logging in."
        );
        return;
      }
      if (res.headers.get("Content-Type") === "application/json") {
        const error = await res.json();
        "message" in error && setSubmissionError(error.message);
      } else {
        setSubmissionError(
          res.status === 409 ? "Username already exists." : "An unknown error"
        );
      }
    } catch (error) {
      const message =
        !!error && typeof error === "object" && "message" in error
          ? (error.message as string)
          : "Unknown";
      if (!outerRes) {
        setSubmissionError(`Registration failed. Reason: ${message}`);
        return;
      }
      // Login failed post registration
      openNotifPopup({
        message:
          "Successfully Registered but failed to login. Please try again by logging in.",
        duration: 5000,
        visible: true,
      });
    }
  };
  const fields: RegisterFields = {
    username: {
      type: "text",
      label: "Username",
      required: true,
      placeholder: "Enter your username",
      validator: validateUsername,
    },
    name: {
      type: "text",
      label: "Name",
      required: true,
      placeholder: "Enter your name",
      validator: validateName,
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
        title="Register"
        subtitle=""
        submitLabel={loading ? "Registering..." : "Register"}
        fields={fields}
        onSubmit={onSubmit}
        submitDisabled={loading}
        submissionError={submissionError}
      />
    </div>
  );
};
