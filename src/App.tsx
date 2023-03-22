import { ThemeProvider } from "@mui/material";
import React from "react";
import "./App.css";
import { PairminatorApp } from "./components/PairminatorApp";
import { AuthProvider } from "./context/AuthContext";
import { DatabaseProvider } from "./context/DatabaseContext";
import { PairminatorProvider } from "./context/PairminatorContext";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider>
        <AuthProvider>
          <PairminatorProvider>
            <PairminatorApp />
          </PairminatorProvider>
        </AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

export default App;
