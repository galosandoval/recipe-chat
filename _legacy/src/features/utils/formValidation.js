import * as yup from "yup";

export default yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  passwordConfirmation: yup.string().oneOf([yup.ref("password"), null], "Passwords must match")
});
