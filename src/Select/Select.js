import React, { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import styles from "./Select.module.scss";
import useDebounce from "../hooks/useDebonce";
import { isEnter, isEsc } from "../helpers/keyboard";

const Select = ({
  placeholder,
  selected,
  options,
  onSelect,
  multiple,
  onServerSearch,
  searchDelay,
}) => {
  const [search, setSearch] = useState((!multiple && selected?.label) || "");
  const [prevSearch, setPrevSearch] = useState("");
  const [selectedOptions, setSelectedOptions] = useState(
    (multiple && selected) || []
  );
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debouncedSearch = useDebounce(search, searchDelay);

  const getIsSelected = (id) =>
    multiple ? !!selectedOptions.find((o) => o.id === id) : selected?.id === id;

  const clientSearch = useCallback(
    (searchText) => {
      const searchLC = searchText.toLowerCase();
      return options.filter(
        (option) => !searchLC || option.label.toLowerCase().includes(searchLC)
      );
    },
    [options]
  );

  const handleKeyDown = (event) => {
    if (isEsc(event)) {
      setOpen(false);
      setSearch("");
    }
    if (isEnter(event)) setOpen(true);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onSelect(multiple ? [] : null);
  };

  const handleChange = (event) => {
    if (isLoading) return;
    if (!isOpen) setOpen(true);
    setSearch(event.target.value);
  };

  const handleContainerClick = () => {
    if (!isOpen) {
      setOpen(true);
      setFilteredOptions(options);
    }
    inputRef.current.focus();
  };

  const handleSelect = (option) => () => {
    if (isLoading) return;

    if (multiple) {
      setSearch("");
      inputRef.current.focus();
      getIsSelected(option.id)
        ? onSelect(selectedOptions.filter((o) => o.id !== option.id))
        : onSelect([...selectedOptions, option]);
    } else {
      inputRef.current.blur();
      onSelect(option);
      setOpen(false);
    }
  };

  const handleRemove = (id) => () => {
    onSelect(selectedOptions.filter((o) => o.id !== id));
  };

  useEffect(() => {
    if (!multiple) setSearch("");
    else setSelectedOptions(selected || []);
  }, [multiple, selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current.contains(event.target)) {
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
      .then((filteredData) => setFilteredOptions(filteredData))
      .catch(() => setFilteredOptions(clientSearch(debouncedSearch)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, options, onServerSearch, clientSearch, prevSearch]);

  useEffect(() => {
    if (onServerSearch) return;
    if (!search) return setFilteredOptions(options);
    setFilteredOptions(clientSearch(search));
  }, [search, options, clientSearch, onServerSearch]);

  useEffect(() => {
    const handleKeyDown = (event) => {};

    document.addEventListener("keydown", handleKeyDown);
    return () => document.addEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
          selectedOptions.map(({ id, value }) => (
            <div
              key={id}
              className={styles.selectedOption}
              onClick={handleRemove(id)}
            >
              {value}
            </div>
          ))}

        {!multiple && selected && !isOpen && selected.label}

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
              (!multiple && selected && !isOpen) ||
              (multiple && selectedOptions?.length),
          })}
        >
          {placeholder}
        </div>

        {(!multiple && selected) || (multiple && selectedOptions.length) ? (
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

Select.propTypes = {
  placeholder: PropTypes.string,
  selected: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  options: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
  multiple: PropTypes.bool,
  onServerSearch: PropTypes.func,
  searchDelay: PropTypes.number,
};

Select.defaultProps = {
  onSelect: () => {},
  options: [],
  multiple: false,
  searchDelay: 300,
};
