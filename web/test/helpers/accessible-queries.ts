/**
 * Accessible, async-safe test query helpers for React 19 + MUI 7
 *
 * These helpers follow Testing Library best practices and handle React 19's
 * automatic batching and async rendering. Always prefer these over direct
 * text queries for better accessibility and more resilient tests.
 *
 * Query Priority Hierarchy:
 * 1. getByRole/findByRole (most accessible)
 * 2. getByLabelText/findByLabelText
 * 3. getByPlaceholderText
 * 4. getByText (use sparingly)
 * 5. getByTestId (last resort)
 */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Async-safe helper for finding buttons by accessible name
 *
 * Use this after interactions that trigger React 19 state updates.
 *
 * @example
 * const submitButton = await findButton("Submit");
 * await userEvent.click(submitButton);
 *
 * @example with regex
 * const backButton = await findButton(/back/i);
 */
export const findButton = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("button", { name });
};

/**
 * Async-safe helper for finding links by accessible name
 *
 * @example
 * const profileLink = await findLink("View Profile");
 * await userEvent.click(profileLink);
 */
export const findLink = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("link", { name });
};

/**
 * Async-safe helper for form fields with labels
 *
 * Tries to find by label first (most accessible), falls back to placeholder.
 *
 * @example
 * const emailField = await findInput("Email");
 * await userEvent.type(emailField, "user@example.com");
 */
export const findInput = async (labelOrPlaceholder: string): Promise<HTMLElement> => {
  try {
    return await screen.findByLabelText(labelOrPlaceholder);
  } catch {
    return await screen.findByPlaceholderText(labelOrPlaceholder);
  }
};

/**
 * Async-safe helper for finding textbox/input by label with specific role
 *
 * Useful when you need to disambiguate between multiple fields with similar labels.
 *
 * @example
 * const searchBox = await findTextbox("Search");
 */
export const findTextbox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("textbox", { name });
};

/**
 * Async-safe helper for finding combobox (select/autocomplete) by label
 *
 * @example
 * const industrySelect = await findCombobox("Industry");
 */
export const findCombobox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("combobox", { name });
};

/**
 * Helper for MUI Select/Autocomplete with async option selection by text
 *
 * This handles the full interaction flow: opening the listbox and selecting an option.
 *
 * @example
 * await selectOptionByText("Industry", "E-commerce");
 *
 * @param label - The accessible label of the select/autocomplete field
 * @param optionText - The visible text of the option to select
 */
export const selectOptionByText = async (label: string, optionText: string): Promise<void> => {
  // Find and open the combobox
  const input = await screen.findByLabelText(label);
  await userEvent.click(input);

  // Wait for listbox to appear and find the option
  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByRole("option", { name: optionText });
  await userEvent.click(option);
};

/**
 * Helper for MUI Select/Autocomplete with async option selection by test-id
 *
 * Use this when options don't have meaningful accessible names.
 *
 * @example
 * await selectOptionByTestId("Industry", "e-commerce");
 *
 * @param label - The accessible label of the select/autocomplete field
 * @param testId - The data-testid of the option to select
 */
export const selectOptionByTestId = async (label: string, testId: string): Promise<void> => {
  // Find and open the combobox
  const input = await screen.findByLabelText(label);
  await userEvent.click(input);

  // Wait for listbox to appear and find the option by testid
  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByTestId(testId);
  await userEvent.click(option);
};

/**
 * Async-safe helper for finding alerts (error messages, notifications)
 *
 * @example
 * const errorAlert = await findAlert();
 * expect(errorAlert).toHaveTextContent("Invalid email");
 */
export const findAlert = async (): Promise<HTMLElement> => {
  return await screen.findByRole("alert");
};

/**
 * Async-safe helper for finding headings by level and name
 *
 * @example
 * const pageTitle = await findHeading(1, "Dashboard");
 * const sectionTitle = await findHeading(2, /settings/i);
 */
export const findHeading = async (
  level: 1 | 2 | 3 | 4 | 5 | 6,
  name?: string | RegExp,
): Promise<HTMLElement> => {
  return await screen.findByRole("heading", { level, ...(name && { name }) });
};

/**
 * Async-safe helper for finding checkboxes by label
 *
 * @example
 * const agreeCheckbox = await findCheckbox("I agree to terms");
 * await userEvent.click(agreeCheckbox);
 */
export const findCheckbox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("checkbox", { name });
};

/**
 * Async-safe helper for finding radio buttons by label
 *
 * @example
 * const optionA = await findRadio("Option A");
 * await userEvent.click(optionA);
 */
export const findRadio = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("radio", { name });
};
