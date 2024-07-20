import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ContactForm from "~/components/common/contact-us-form";

describe("ContactForm Component", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers(); // Clear timers after each test
  });

  const setup = () => {
    const { container } = render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText("Enter full name") as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText("Enter email address") as HTMLInputElement;
    const phoneInput = screen.getByPlaceholderText("Enter phone number") as HTMLInputElement;
    const messageInput = screen.getByPlaceholderText("Message...") as HTMLInputElement;
    const submitButton = screen.getByText("Send");
    return {
      container,
      nameInput,
      emailInput,
      phoneInput,
      messageInput,
      submitButton,
    };
  };

  it("should render all form fields and submit button", () => {
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } = setup();
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(messageInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("should validate all required form fields", async () => {
    const { submitButton } = setup();
    fireEvent.click(submitButton);

    // Ensure that the error messages for all required fields are present
    await expect(screen.findAllByText(/is required/)).resolves.toHaveLength(2);
  });

  it("should validate email format", async () => {
    const { emailInput, submitButton } = setup();
    fireEvent.change(emailInput, { target: { value: "invalid-email@kkk" } });
    fireEvent.click(submitButton);
    const errorMessage = await screen.findByText("Email is invalid");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should validate phone number format", async () => {
    const { phoneInput, submitButton } = setup();
    fireEvent.change(phoneInput, { target: { value: "123" } });
    fireEvent.click(submitButton);
    const errorMessage = await screen.findByText("Phone number is invalid");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should submit the form successfully", async () => {
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } = setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Form submitted successfully!" }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Form submitted successfully!")).toBeInTheDocument();
  });

  it("should handle form submission error", async () => {
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } = setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to submit the form." }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Failed to submit the form.")).toBeInTheDocument();
  });

  it("should reset form and clear errors after successful submission", async () => {
    const { nameInput, emailInput, phoneInput, messageInput, submitButton } = setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Form submitted successfully!" }),
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Form submitted successfully!")).toBeInTheDocument();

    // Verify form reset and error clearing
    expect((nameInput as HTMLInputElement).value).toBe("");
    expect((emailInput as HTMLInputElement).value).toBe("");
    expect((phoneInput as HTMLInputElement).value).toBe("");
    expect((messageInput as HTMLInputElement).value).toBe("");
    expect(screen.queryByText(/is required/)).toBeNull();
  });
});
