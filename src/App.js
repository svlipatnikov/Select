import React, { useState } from "react";
import Select from "./Select";

import styles from "./App.module.scss";

import { options } from "./options";

const App = () => {
  const [selected1, setSelected1] = useState();
  const [selected2, setSelected2] = useState();
  const [selected3, setSelected3] = useState();
  const [selected4, setSelected4] = useState();

  const mockServerSearch = (isError) => (searchText) => {
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

  return (
    <div className={styles.wrapper}>
      <h2>Select default</h2>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected1}
        onSelect={setSelected1}
      />

      <h2>Select multiple</h2>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected2}
        onSelect={setSelected2}
        multiple
      />

      <h2>Select default + OK server search</h2>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected3}
        onSelect={setSelected3}
        onServerSearch={mockServerSearch(false)}
        searchDelay={500}
      />

      <h2>Select multiple + ERROR server search</h2>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected4}
        onSelect={setSelected4}
        multiple
        onServerSearch={mockServerSearch(true)}
        searchDelay={500}
      />
    </div>
  );
};

export default App;
