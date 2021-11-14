import React, { useState } from "react";
import Select from "./Select";

import { mockServerSearch } from "./mock/serverSearch";
import { options } from "./mock/options";
import { Option } from "./Select/types";
import styles from "./App.module.scss";

const App = () => {
  const [selected1, setSelected1] = useState<Option | Option[] | null>(null);
  const [selected2, setSelected2] = useState<Option | Option[] | null>([]);
  const [selected3, setSelected3] = useState<Option | Option[] | null>(null);
  const [selected4, setSelected4] = useState<Option | Option[] | null>([]);

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
        onServerSearch={mockServerSearch(options, false)}
        searchDelay={500}
      />

      <h2>Select multiple + ERROR server search</h2>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected4}
        onSelect={setSelected4}
        onServerSearch={mockServerSearch(options, true)}
        searchDelay={500}
        multiple
      />
    </div>
  );
};

export default App;
