import { fireEvent, MatcherFunction, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dayjs } from "dayjs";

export const selectLocationByText = (value: string): void => {
  fireEvent.mouseDown(screen.getByLabelText("Location"));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByText(value));
};

export const getInputElementByLabel = (label: string): HTMLInputElement => {
  return screen.getByLabelText(label) as HTMLInputElement;
};

export const fillText = (label: string, value: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.change(item, { target: { value: value } });
  fireEvent.blur(item);
};

export const fillTextUserEvent = async (label: string, value: string): Promise<void> => {
  const item = screen.getByLabelText(label);
  await userEvent.clear(item);
  if (value !== "") {
    await userEvent.type(item, value);
  }
  await userEvent.tab();
};

export const selectDate = (date: Dayjs): void => {
  const item = screen.getByLabelText("Date of formation");
  fireEvent.change(item, { target: { value: date.format("MM/YYYY") } });
  fireEvent.blur(item);
};

export const selectDropdownByValue = (label: string, value: string): void => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByTestId(value));
};

export const selectComboboxValueByTextClick = (
  comboboxLabel: string,
  selectionText: string,
): void => {
  const combobox = screen.getByRole("combobox", { name: comboboxLabel });

  fireEvent.click(combobox);

  const listbox = screen.getByRole("listbox");
  fireEvent.click(within(listbox).getByText(selectionText));
  fireEvent.blur(combobox);
};

type Query = (f: MatcherFunction) => HTMLElement;

export const withMarkup = (query: Query) => {
  return (text: string): HTMLElement => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return query((_content: string, node: any) => {
      const hasText = (node: HTMLElement): boolean => {
        return node.textContent === text;
      };
      // eslint-disable-next-line testing-library/no-node-access
      const childrenDontHaveText = [...node.children].every((child) => {
        return !hasText(child as HTMLElement);
      });
      return hasText(node) && childrenDontHaveText;
    });
  };
};
