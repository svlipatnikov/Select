export interface Option {
  id: number;
  value: string;
  label: string;
}

export interface SelectProps {
  placeholder: string;
  selected: Option | Option[] | null;
  options: Option[];
  multiple?: boolean;
  onSelect(option: Option | Option[] | null): void;
  onServerSearch?: (search: string) => Promise<Option[] | undefined>;
  searchDelay?: number;
}
