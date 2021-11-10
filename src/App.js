import React, { useState } from "react";
import Select from "./Select";

import styles from "./App.module.scss";

import { options } from "./options";

const App = () => {
  const [selected, setSelected] = useState();

  return (
    <div className={styles.wrapper}>
      <Select
        placeholder="Выберите"
        options={options}
        selected={selected}
        onSelect={setSelected}
        multiple
      />
    </div>
  );
};

export default App;
