import React, { useRef, useState, useEffect, useCallback } from "react";
import cn from "classnames";

import { isEnter, isEsc } from "../helpers/keyboard";
import useDebounce from "../hooks/useDebonce";

import styles from "./Select.module.scss";
import { Option, SelectProps } from "./types";

const Select = ({
  placeholder,
  selected,
  options,
  onSelect,
  multiple,
  onServerSearch,
  searchDelay,
}: SelectProps) => {
  const [search, setSearch] = useState("");
  const [prevSearch, setPrevSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options || []);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, searchDelay || 300);

  const getIsSelected = (id: number): boolean =>
    multiple
      ? (selected as Option[])?.some((option: Option) => option.id === id)
      : (selected as Option)?.id === id;

  const clientSearch = useCallback(
    (searchText) => {
      const searchLC = searchText.toLowerCase();
      return options.filter(
        (option: Option) =>
          !searchLC || option.label.toLowerCase().includes(searchLC)
      );
    },
    [options]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEsc(event)) {
      setOpen(false);
      setSearch("");
    }
    if (isEnter(event)) setOpen(true);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(multiple ? [] : null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    if (!isOpen) setOpen(true);
    setSearch(event.target.value);
  };

  const handleContainerClick = () => {
    if (!isOpen) {
      setOpen(true);
      setFilteredOptions(options);
    }
    inputRef.current?.focus();
  };

  const handleSelect = (option: Option) => () => {
    if (isLoading) return;

    setSearch("");
    if (multiple) {
      inputRef.current?.focus();
      getIsSelected(option.id)
        ? onSelect(
            (selected as Option[])?.filter((o) => o.id !== option.id) || []
          )
        : onSelect([...((selected as Option[]) || []), option]);
    } else {
      inputRef.current?.blur();
      onSelect(option);
      setOpen(false);
    }
  };

  const handleRemove = (id: number) => () => {
    onSelect((selected as Option[]).filter((o) => o.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!wrapperRef.current?.contains(event.target as HTMLElement)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (!onServerSearch || debouncedSearch === prevSearch) return;
    if (!debouncedSearch) return setFilteredOptions(options);

    setPrevSearch(debouncedSearch);
    setLoading(true);
    onServerSearch(debouncedSearch)
      .then((filteredData) => setFilteredOptions(filteredData || []))
      .catch(() => setFilteredOptions(clientSearch(debouncedSearch)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, options, onServerSearch, clientSearch, prevSearch]);

  useEffect(() => {
    if (!!onServerSearch) return;
    if (!search) return setFilteredOptions(options);
    setFilteredOptions(clientSearch(search));
  }, [search, options, clientSearch, onServerSearch]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={cn({
          [styles.inputContainer]: true,
          [styles.inputContainer_active]: isOpen,
        })}
        onClick={handleContainerClick}
        ref={selectRef}
      >
        {multiple &&
          (selected as Option[])?.map(({ id, value }) => (
            <div
              key={id}
              className={styles.selectedOption}
              onClick={handleRemove(id)}
            >
              {value}
            </div>
          ))}

        {!multiple && selected && !isOpen && (selected as Option)?.label}

        <input
          className={styles.input}
          type="text"
          value={search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          size={search.length || 1}
          maxLength={20}
          ref={inputRef}
        />

        <div
          className={cn({
            [styles.placeholder]: true,
            [styles.placeholder_active]:
              !!search ||
              (!multiple && (selected as Option) && !isOpen) ||
              (multiple && (selected as Option[])?.length),
          })}
        >
          {placeholder}
        </div>

        {(!multiple && (selected as Option)) ||
        (multiple && (selected as Option[])?.length) ? (
          <div className={styles.clearBtn} onClick={handleClear} />
        ) : (
          <div className={cn(styles.arrow, { [styles.arrow_up]: isOpen })} />
        )}
      </div>

      {isOpen && (
        <div className={styles.dropField}>
          <div className={styles.dropFieldContainer}>
            <div>
              {filteredOptions.map((option) => (
                <div
                  className={cn({
                    [styles.optionItem]: true,
                    [styles.optionItem_selected]: getIsSelected(option.id),
                  })}
                  key={option.id}
                  onClick={handleSelect(option)}
                >
                  {option.label}
                </div>
              ))}

              {!filteredOptions.length && (
                <div className={styles.empty}>Ничего не найдено</div>
              )}
            </div>
          </div>

          {isLoading && <div className={styles.loader} />}
        </div>
      )}
    </div>
  );
};

export default Select;
