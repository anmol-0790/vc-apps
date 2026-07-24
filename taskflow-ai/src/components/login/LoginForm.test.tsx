import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  return screen.getByRole("textbox", { name: /work email/i });
}

function getPasswordField() {
  return screen.getByPlaceholderText("Enter your password");
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /^sign in$/i });
}

async function fillForm(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(getEmailField(), email);
  await user.type(getPasswordField(), password);
  return user;
}

describe("LoginForm", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    localStorage.clear();
  });

  it("shows validation errors for an empty form", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(getSubmitButton());

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("shows an error for an invalid email", async () => {
    render(<LoginForm />);
    const user = await fillForm("bad-email", "password1");
    await user.click(getSubmitButton());

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("shows an error for an invalid password", async () => {
    render(<LoginForm />);
    const user = await fillForm("user@example.com", "short");
    await user.click(getSubmitButton());

    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("shows a loading state while signing in", async () => {
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

    const loadingButton = screen.getByRole("button", { name: /loading/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
    expect(getEmailField()).toBeDisabled();

    resolveLogin({
      token: "tok",
      user: { id: "1", email: "user@example.com" },
    });

    await waitFor(() => {
      expect(getSubmitButton()).toBeEnabled();
    });
  });

  it("shows a success state after a successful login", async () => {
    mockedLogin.mockResolvedValue({
      token: "tok",
      user: { id: "1", email: "user@example.com" },
    });

    render(<LoginForm />);
    const user = await fillForm("user@example.com", "password1");
    await user.click(getSubmitButton());

    expect(await screen.findByRole("status")).toHaveTextContent(
      /signed in successfully/i,
    );
    expect(mockedLogin).toHaveBeenCalledWith("user@example.com", "password1");
  });

  it("shows an error state after a failed login", async () => {
    mockedLogin.mockRejectedValue(
      new LoginRequestError("Invalid email or password.", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      }),
    );

    render(<LoginForm />);
    const user = await fillForm("fail@example.com", "password1");
    await user.click(getSubmitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a create account signup option", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: /create a free account/i }),
    ).toHaveAttribute("href", "/signup");
  });
});
