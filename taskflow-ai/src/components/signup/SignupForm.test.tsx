import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "@/components/signup/SignupForm";
import { SignupRequestError } from "@/lib/signup";

vi.mock("@/lib/signup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/signup")>();
  return {
    ...actual,
    signupRequest: vi.fn(),
  };
});

import { signupRequest } from "@/lib/signup";

const mockedSignup = vi.mocked(signupRequest);

function getNameField() {
  return screen.getByRole("textbox", { name: /full name/i });
}

function getEmailField() {
  return screen.getByRole("textbox", { name: /^email$/i });
}

function getPasswordField() {
  return screen.getByPlaceholderText("Min. 8 characters");
}

function getConfirmField() {
  return screen.getByPlaceholderText("Repeat your password");
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /create account/i });
}

async function fillValidForm() {
  const user = userEvent.setup();
  await user.type(getNameField(), "Jane Smith");
  await user.type(getEmailField(), "jane@example.com");
  await user.type(getPasswordField(), "password1");
  await user.type(getConfirmField(), "password1");
  await user.click(screen.getByRole("checkbox", { name: /i agree to the/i }));
  return user;
}

describe("SignupForm", () => {
  beforeEach(() => {
    mockedSignup.mockReset();
  });

  it("shows validation errors for an empty form", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(getSubmitButton());

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockedSignup).not.toHaveBeenCalled();
  });

  it("shows a loading state while creating an account", async () => {
    let resolveSignup!: (value: {
      token: string;
      user: { id: string; email: string };
    }) => void;

    mockedSignup.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        }),
    );

    render(<SignupForm />);
    const user = await fillValidForm();
    await user.click(getSubmitButton());

    const loadingButton = screen.getByRole("button", { name: /loading/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    resolveSignup({
      token: "tok",
      user: { id: "1", email: "jane@example.com" },
    });

    await waitFor(() => {
      expect(getSubmitButton()).toBeEnabled();
    });
  });

  it("shows a success state after a successful signup", async () => {
    mockedSignup.mockResolvedValue({
      token: "tok",
      user: { id: "1", email: "jane@example.com" },
    });

    render(<SignupForm />);
    const user = await fillValidForm();
    await user.click(getSubmitButton());

    expect(await screen.findByRole("status")).toHaveTextContent(
      /account created successfully/i,
    );
    expect(mockedSignup).toHaveBeenCalledWith({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password1",
      confirmPassword: "password1",
      termsAccepted: true,
    });
  });

  it("shows an error state after a failed signup", async () => {
    mockedSignup.mockRejectedValue(
      new SignupRequestError("An account with this email already exists.", {
        status: 409,
        code: "EMAIL_TAKEN",
        fields: { email: "An account with this email already exists." },
      }),
    );

    render(<SignupForm />);
    const user = await fillValidForm();
    await user.click(getSubmitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("links to the login page", () => {
    render(<SignupForm />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
