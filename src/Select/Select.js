import React, { useRef, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import styles from "./Select.module.scss";

const Select = ({ placeholder, selected, options, onSelect, multiple }) => {
  const [search, setSearch] = useState((!multiple && selected?.label) || "");
  const [selectedOptions, setSelectedOptions] = useState(
    (multiple && selected) || []
  );
  const [isOpen, setOpen] = useState(false);
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const searchLC = search.toLowerCase();

    return options
      .filter(
        (option) => !search || option.label.toLowerCase().includes(searchLC)
      )
      .filter(
        (option) =>
          !multiple ||
          selectedOptions.findIndex((s) => s.id === option.id) === -1
      );
  }, [multiple, options, search, selectedOptions]);

  const handleChange = (event) => setSearch(event.target.value);

  const handleWrapperClick = () => {
    if (!isOpen) setOpen(true);
    inputRef.current.focus();
    if (!multiple && selected) setSearch("");
  };

  const handleSelect = (option) => () => {
    if (multiple) {
      onSelect([...selectedOptions, option]);
    } else {
      onSelect(option);
      setOpen(false);
    }
  };

  const handleRemove = (id) => () => {
    onSelect(selectedOptions.filter((o) => o.id !== id));
  };

  useEffect(() => {
    if (!multiple) setSearch(selected?.label || "");
    else setSelectedOptions(selected || []);
  }, [multiple, selected]);

  useEffect(() => {
    if (!isOpen && !multiple && selected) setSearch(selected?.label || "");
  }, [isOpen, multiple, selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!selectRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectRef]);

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

      <div className={cn(styles.arrow, { [styles.arrow_up]: isOpen })} />

      {isOpen && !!filteredOptions?.length && (
        <div className={styles.dropField}>
          {filteredOptions.map((option) => (
            <div
              className={cn({
                [styles.optionItem]: true,
                [styles.optionItem_selected]: option.value === selected?.value,
              })}
              key={option.id}
              onClick={handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
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
};

Select.defaultProps = {
  onSelect: () => {},
  options: [],
  multiple: false,
};
