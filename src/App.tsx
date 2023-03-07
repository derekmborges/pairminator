import { ThemeProvider } from "@mui/material";
import React from "react";
import "./App.css";
import { PairminatorApp } from "./components/PairminatorApp";
import { DatabaseProvider } from "./context/DatabaseContext";
import { PairminatorProvider } from "./context/PairminatorContext";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider>
        <PairminatorProvider>
          <PairminatorApp />
        </PairminatorProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

export default App;
