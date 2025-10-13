import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { statesCities } from "@/app/data";
import { validationSchema } from "./validation";
import "./CustomForm.css";
import { CustomFormProps } from "./types";

const CustomForm: React.FC<CustomFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [cities, setCities] = useState<string[]>([]);

  return (
    <Formik
      initialValues={
        initialValues || {
          id: "",
          name: "",
          email: "",
          linkedin: "",
          gender: "",
          address: { line1: "", line2: "", state: "", city: "", pin: "" },
        }
      }
      validationSchema={validationSchema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ setFieldValue }) => (
        <Form className="custom-form">
          <div className="form-group">
            <label>Name:</label>
            <Field name="name" className="form-input" />
            <ErrorMessage name="name" component="div" className="form-error" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <Field name="email" className="form-input" />
            <ErrorMessage name="email" component="div" className="form-error" />
          </div>
          <div className="form-group">
            <label>LinkedIn URL:</label>
            <Field name="linkedin" className="form-input" />
            <ErrorMessage
              name="linkedin"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>Gender:</label>
            <Field as="select" name="gender" className="form-input">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Field>
            <ErrorMessage
              name="gender"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>State:</label>
            <Field
              as="select"
              name="address.state"
              className="form-input"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const state = e.target.value;
                setFieldValue("address.state", state);
                const matched = statesCities.find((s) => s.state === state);
                setCities(matched ? matched.cities : []);
                setFieldValue("address.city", "");
              }}
            >
              <option value="">Select State</option>
              {statesCities.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="address.state"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>City:</label>
            <Field as="select" name="address.city" className="form-input">
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="address.city"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>Line 1:</label>
            <Field name="address.line1" className="form-input" />
            <ErrorMessage
              name="address.line1"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>Line 2:</label>
            <Field name="address.line2" className="form-input" />
            <ErrorMessage
              name="address.line2"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-group">
            <label>PIN:</label>
            <Field name="address.pin" className="form-input" />
            <ErrorMessage
              name="address.pin"
              component="div"
              className="form-error"
            />
          </div>
          <div className="form-buttons">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CustomForm;
