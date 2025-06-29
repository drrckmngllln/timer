import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import ControllerPage from "./ControllerPage";
import { TimerProvider } from "./TimerContext";

const App: React.FC = () => {
  return (
    <Router>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/controller" element={<ControllerPage />} />
        </Routes>
      </TimerProvider>
    </Router>
  );
};

export default App;
