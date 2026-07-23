import { describe, expect, it } from "vitest";
import { validateLoginFields } from "@/lib/login";

describe("validateLoginFields", () => {
  describe("empty form", () => {
    it("requires email and password", () => {
      expect(validateLoginFields("", "")).toEqual({
        email: "Email is required.",
        password: "Password is required.",
      });
    });

    it("treats whitespace-only email as empty", () => {
      expect(validateLoginFields("   ", "password1")).toEqual({
        email: "Email is required.",
      });
    });
  });

  describe("invalid email", () => {
    it("rejects malformed email addresses", () => {
      expect(validateLoginFields("not-an-email", "password1")).toEqual({
        email: "Enter a valid email address.",
      });
    });

    it("rejects email values missing a domain", () => {
      expect(validateLoginFields("user@", "password1")).toEqual({
        email: "Enter a valid email address.",
      });
    });
  });

  describe("invalid password", () => {
    it("rejects passwords shorter than 8 characters", () => {
      expect(validateLoginFields("user@example.com", "short")).toEqual({
        password: "Password must be at least 8 characters.",
      });
    });

    it("rejects an empty password even when email is valid", () => {
      expect(validateLoginFields("user@example.com", "")).toEqual({
        password: "Password is required.",
      });
    });
  });

  describe("valid credentials", () => {
    it("returns no errors", () => {
      expect(validateLoginFields("user@example.com", "password1")).toEqual({});
    });
  });
});
