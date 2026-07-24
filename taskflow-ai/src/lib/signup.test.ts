import { describe, expect, it } from "vitest";
import {
  getPasswordStrength,
  validateSignupFields,
} from "@/lib/signup";

describe("getPasswordStrength", () => {
  it("returns empty score for blank password", () => {
    expect(getPasswordStrength("")).toEqual({ score: 0, label: null });
  });

  it("scores length, uppercase, digit, and symbol", () => {
    expect(getPasswordStrength("abcdefgh").label).toBe("Weak");
    expect(getPasswordStrength("Abcdefgh").label).toBe("Fair");
    expect(getPasswordStrength("Abcdefg1").label).toBe("Good");
    expect(getPasswordStrength("Abcdefg1!").label).toBe("Strong");
  });
});

describe("validateSignupFields", () => {
  const valid = {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password1",
    confirmPassword: "password1",
    termsAccepted: true,
  };

  it("requires all fields and terms", () => {
    expect(
      validateSignupFields({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
      }),
    ).toEqual({
      name: "Full name is required.",
      email: "Email is required.",
      password: "Password is required.",
      confirmPassword: "Confirm your password.",
      terms: "You must agree to the Terms of Service and Privacy Policy.",
    });
  });

  it("rejects mismatched passwords", () => {
    expect(
      validateSignupFields({
        ...valid,
        confirmPassword: "different1",
      }),
    ).toEqual({
      confirmPassword: "Passwords do not match.",
    });
  });

  it("returns no errors for valid input", () => {
    expect(validateSignupFields(valid)).toEqual({});
  });
});
