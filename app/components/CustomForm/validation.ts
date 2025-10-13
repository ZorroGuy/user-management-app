import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .max(10, "Name cannot exceed 10 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  linkedin: Yup.string()
    .url("Invalid URL")
    .required("LinkedIn URL is required"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.object().shape({
    line1: Yup.string()
      .matches(/[a-zA-Z0-9\s]/, "Invalid Line 1")
      .required("Line 1 is required"),
    line2: Yup.string()
      .matches(/[a-zA-Z0-9\s]/, "Invalid Line 2")
      .required("Line 2 is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    pin: Yup.string()
      .matches(/^\d{6}$/, "PIN must be 6 digits")
      .required("PIN is required"),
  }),
});
