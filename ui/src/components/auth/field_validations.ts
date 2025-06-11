export const validateUsername = (username: string) => {
  if (username.length < 3 || username.length > 30) {
    return "Error: Username cannot be smaller than 3 characters or longer than 30 characters.";
  }
  if (!/^[0-9a-zA-Z_-]+$/.test(username)) {
    return "Error: A username may contain alphabets, digits, underscores, and hyphens. No spaces.";
  }
  return "";
};

export const validateName = (name: string) => {
  if (name.length < 1 || name.length > 100) {
    return "Error: A name must be between 1 and 100 characters long.";
  }
  if (!/^[0-9a-zA-Z \.\-\']+$/.test(name)) {
    return "Error: A name may only contain alphabets, digits, hyphens, periods, spaces, and apostrophes";
  }
  return "";
};

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Error: Password must be at least 8 characters long.";
  }
  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,}$/.test(
      password
    )
  ) {
    return "A password must contain a lowercase, an uppercase, a digit, and a special character. No whitespaces allowed";
  }
  return "";
};
