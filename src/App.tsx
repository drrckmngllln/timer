import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TimerProvider } from "./timerContext";
import LandingPage from "./LandingPage";
import ControllerPage from "./ControllerPage";

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
