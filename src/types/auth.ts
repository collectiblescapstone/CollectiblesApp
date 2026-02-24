export type LoginFormValues = {
  emailOrUsername: string;
  password: string;
};

export type SignupFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgetPasswordFormValues = {
  email: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};
