import { Option } from "../Select/types";

export const mockServerSearch =
  (options: Option[], isError: boolean) =>
  (searchText: string): Promise<Option[] | undefined> => {
    const searcLC = searchText.toLowerCase();
    const filteredOptions = options.filter(
      (option) => !searchText || option.label.toLowerCase().includes(searcLC)
    );

    if (isError || !filteredOptions.length)
      return new Promise((_, reject) => setTimeout(reject, 1500));

    return new Promise((resolve) =>
      setTimeout(() => resolve(filteredOptions), 1500)
    );
  };
