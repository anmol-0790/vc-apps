import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginRequestError } from "@/lib/login";

vi.mock("@/lib/login", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/login")>();
  return {
    ...actual,
    loginRequest: vi.fn(),
  };
});

import { loginRequest } from "@/lib/login";

const mockedLogin = vi.mocked(loginRequest);

function getEmailField() {
  return screen.getByRole("textbox", { name: /email/i });
}

function getPasswordField() {
  return screen.getByPlaceholderText("Enter your password");
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /log in/i });
}

async function fillForm(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(getEmailField(), email);
  await user.type(getPasswordField(), password);
  return user;
}

describe("Login page", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    localStorage.clear();
  });

  describe("page shell", () => {
    it("renders the login heading and form controls", () => {
      render(<LoginPage />);

      expect(
        screen.getByRole("heading", { name: /log in/i }),
      ).toBeInTheDocument();
      expect(getEmailField()).toBeInTheDocument();
      expect(getPasswordField()).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /remember me/i }),
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeEnabled();
    });

    it("associates the form with the page heading", () => {
      render(<LoginPage />);

      const form = document.querySelector("form");
      expect(form).toHaveAttribute("aria-labelledby", "login-heading");
    });
  });

  describe("empty form", () => {
    it("shows required errors for email and password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(getSubmitButton());

      expect(screen.getByText("Email is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
      expect(getEmailField()).toHaveAttribute("aria-invalid", "true");
      expect(getPasswordField()).toHaveAttribute("aria-invalid", "true");
      expect(mockedLogin).not.toHaveBeenCalled();
    });

    it("focuses the email field first when both fields are empty", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(getSubmitButton());

      expect(getEmailField()).toHaveFocus();
    });
  });

  describe("invalid email", () => {
    it("shows an email format error and does not submit", async () => {
      render(<LoginForm />);
      const user = await fillForm("not-an-email", "password1");

      await user.click(getSubmitButton());

      expect(
        screen.getByText("Enter a valid email address."),
      ).toBeInTheDocument();
      expect(getEmailField()).toHaveAttribute("aria-invalid", "true");
      expect(screen.queryByText("Password is required.")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Password must be at least 8 characters."),
      ).not.toBeInTheDocument();
      expect(mockedLogin).not.toHaveBeenCalled();
    });

    it("clears the email error when the user edits the field", async () => {
      render(<LoginForm />);
      const user = await fillForm("bad-email", "password1");
      await user.click(getSubmitButton());

      expect(
        screen.getByText("Enter a valid email address."),
      ).toBeInTheDocument();

      await user.type(getEmailField(), "@example.com");

      expect(
        screen.queryByText("Enter a valid email address."),
      ).not.toBeInTheDocument();
    });
  });

  describe("invalid password", () => {
    it("shows a minimum-length error and does not submit", async () => {
      render(<LoginForm />);
      const user = await fillForm("user@example.com", "short");

      await user.click(getSubmitButton());

      expect(
        screen.getByText("Password must be at least 8 characters."),
      ).toBeInTheDocument();
      expect(getPasswordField()).toHaveAttribute("aria-invalid", "true");
      expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Enter a valid email address."),
      ).not.toBeInTheDocument();
      expect(mockedLogin).not.toHaveBeenCalled();
    });

    it("focuses the password field when only password is invalid", async () => {
      render(<LoginForm />);
      const user = await fillForm("user@example.com", "short");

      await user.click(getSubmitButton());

      expect(getPasswordField()).toHaveFocus();
    });
  });

  describe("successful login", () => {
    it("calls the login API and shows a success status", async () => {
      mockedLogin.mockResolvedValue({
        token: "tok_123",
        user: { id: "user_1", email: "user@example.com" },
      });

      render(<LoginForm />);
      const user = await fillForm("user@example.com", "password1");
      await user.click(getSubmitButton());

      expect(mockedLogin).toHaveBeenCalledTimes(1);
      expect(mockedLogin).toHaveBeenCalledWith("user@example.com", "password1");

      const status = await screen.findByRole("status");
      expect(status).toHaveTextContent("Signed in successfully.");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("persists the email when Remember me is checked", async () => {
      mockedLogin.mockResolvedValue({
        token: "tok_123",
        user: { id: "user_1", email: "user@example.com" },
      });

      render(<LoginForm />);
      const user = await fillForm("user@example.com", "password1");
      await user.click(screen.getByRole("checkbox", { name: /remember me/i }));
      await user.click(getSubmitButton());

      await screen.findByRole("status");
      expect(localStorage.getItem("taskflow.login.email")).toBe(
        "user@example.com",
      );
    });
  });

  describe("loading state", () => {
    it("disables controls and shows Signing in while the request is pending", async () => {
      let resolveLogin!: (value: {
        token: string;
        user: { id: string; email: string };
      }) => void;

      mockedLogin.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          }),
      );

      render(<LoginForm />);
      const user = await fillForm("user@example.com", "password1");
      await user.click(getSubmitButton());

      const loadingButton = screen.getByRole("button", { name: /signing in/i });
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveAttribute("aria-busy", "true");
      expect(getEmailField()).toBeDisabled();
      expect(getPasswordField()).toBeDisabled();
      expect(
        screen.getByRole("checkbox", { name: /remember me/i }),
      ).toBeDisabled();

      resolveLogin({
        token: "tok_123",
        user: { id: "user_1", email: "user@example.com" },
      });

      await waitFor(() => {
        expect(getSubmitButton()).toBeEnabled();
      });
      expect(getEmailField()).toBeEnabled();
      expect(getPasswordField()).toBeEnabled();
    });
  });

  describe("error state", () => {
    it("shows an alert when authentication fails", async () => {
      mockedLogin.mockRejectedValue(
        new LoginRequestError("Invalid email or password.", {
          status: 401,
          code: "INVALID_CREDENTIALS",
        }),
      );

      render(<LoginForm />);
      const user = await fillForm("fail@example.com", "password1");
      await user.click(getSubmitButton());

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Invalid email or password.");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeEnabled();
    });

    it("maps server field errors onto inputs", async () => {
      mockedLogin.mockRejectedValue(
        new LoginRequestError("Please correct the highlighted fields.", {
          status: 400,
          code: "VALIDATION_ERROR",
          fields: { email: "Enter a valid email address." },
        }),
      );

      render(<LoginForm />);
      const user = await fillForm("user@example.com", "password1");
      await user.click(getSubmitButton());

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Please correct the highlighted fields.");
      expect(
        screen.getByText("Enter a valid email address."),
      ).toBeInTheDocument();
      expect(getEmailField()).toHaveAttribute("aria-invalid", "true");
      await waitFor(() => {
        expect(getEmailField()).toHaveFocus();
      });
    });

    it("clears the form error when the user edits a field", async () => {
      mockedLogin.mockRejectedValue(
        new LoginRequestError("Invalid email or password.", {
          status: 401,
          code: "INVALID_CREDENTIALS",
        }),
      );

      render(<LoginForm />);
      const user = await fillForm("fail@example.com", "password1");
      await user.click(getSubmitButton());
      await screen.findByRole("alert");

      await user.type(getEmailField(), "x");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("describes the form with the error alert id", async () => {
      mockedLogin.mockRejectedValue(
        new LoginRequestError("Invalid email or password.", {
          status: 401,
          code: "INVALID_CREDENTIALS",
        }),
      );

      render(<LoginForm />);
      const user = await fillForm("fail@example.com", "password1");
      await user.click(getSubmitButton());

      const alert = await screen.findByRole("alert");
      const form = alert.closest("form");
      expect(form).toBeTruthy();
      expect(form).toHaveAttribute("aria-describedby", alert.id);
      expect(within(form as HTMLElement).getByRole("alert")).toBe(alert);
    });
  });
});
