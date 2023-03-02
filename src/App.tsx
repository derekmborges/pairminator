import React from "react";
import "./App.css";
import { PairminatorApp } from "./components/PairminatorApp";
import { DatabaseProvider } from "./context/DatabaseContext";
import { PairminatorProvider } from "./context/PairminatorContext";

function App() {
  return (
    <DatabaseProvider>
      <PairminatorProvider>
        <PairminatorApp />
      </PairminatorProvider>
    </DatabaseProvider>
  );
}

export default App;
