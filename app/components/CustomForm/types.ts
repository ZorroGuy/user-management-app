import { User } from "@/app/redux/slices/userSlice";

export interface CustomFormProps {
  initialValues?: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}
