import React, { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import styles from "./Select.module.scss";
import useDebounce from "../hooks/useDebonce";

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
  const debouncedSearch = useDebounce(search, searchDelay);

  const frontSearch = useCallback(
    (searchText) => {
      const searchLC = searchText.toLowerCase();
      return options.filter(
        (option) => !searchLC || option.label.toLowerCase().includes(searchLC)
      );
    },
    [options]
  );

  const handleClear = (event) => {
    event.stopPropagation();
    onSelect(multiple ? [] : null);
  };

  const handleChange = (event) => {
    if (isLoading) return;
    setSearch(event.target.value);
  };

  const handleWrapperClick = () => {
    if (!isOpen) {
      setOpen(true);
      inputRef.current.focus();
      setFilteredOptions(options);
    } else {
      if (multiple) inputRef.current.focus();
    }
    if (!multiple && selected) setSearch("");
  };

  const handleSelect = (option) => () => {
    if (multiple) {
      setSearch("");
      if (selectedOptions.findIndex((s) => s.id === option.id) === -1)
        onSelect([...selectedOptions, option]);
    } else {
      onSelect(option);
      setOpen(false);
      inputRef.current.blur();
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
      if (!selectRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectRef]);

  useEffect(() => {
    if (!onServerSearch || debouncedSearch === prevSearch) return;
    if (!debouncedSearch) return setFilteredOptions(options);

    setPrevSearch(debouncedSearch);
    setLoading(true);
    onServerSearch(debouncedSearch)
      .then((filteredData) => setFilteredOptions(filteredData))
      .catch(() => setFilteredOptions(frontSearch(debouncedSearch)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, options, onServerSearch, frontSearch, prevSearch]);

  useEffect(() => {
    if (onServerSearch) return;
    if (!search) return setFilteredOptions(options);
    setFilteredOptions(frontSearch(search));
  }, [search, options, frontSearch, onServerSearch]);

  return (
    <div
      className={cn({
        [styles.wrapper]: true,
        [styles.wrapper_active]: isOpen,
      })}
      onClick={handleWrapperClick}
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
        size={search.length || 1}
        maxLength={20}
        ref={inputRef}
      />

      <div
        className={cn({
          [styles.placeholder]: true,
          [styles.placeholder_active]:
            !!search ||
            (!multiple && selected) ||
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

      {isOpen && (
        <div className={styles.dropField}>
          <div className={styles.dropFieldContainer}>
            <div>
              {filteredOptions.map((option) => (
                <div
                  className={styles.optionItem}
                  key={option.id}
                  onClick={handleSelect(option)}
                >
                  {option.label}
                </div>
              ))}

              {!filteredOptions.length && (
                <div className={styles.empty}>Ничего не найдено</div>
              )}

              {isLoading && <div className={styles.loader} />}
            </div>
          </div>
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
