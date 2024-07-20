import { useState } from "react";

import { SearchItem } from "@org/db-and-api-interfaces";

import { ResultTable } from "./result-table";
import { SearchBar } from "./search-bar";

export function App() {
  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState(new Array<SearchItem>())

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <SearchBar
          isLoading={isLoading}
          setLoading={setLoading}
          setTableData={setTableData}
        />
      </div>
      <div className="flex-grow h-0 min-h-24 flex items-center justify-center">
        <ResultTable
          isLoading={isLoading}
          tableData={tableData}
        />
      </div>
    </div>
  );
}

export default App;
