import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Main from "./main/Main";
import Workspace from "./workspace/Workspace";
import "./App.css";

function App() {
  let [selectedWorkspace, setSelectedWorkspace] = useState<string[] | null>(null);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main setSelectedWorkspace={setSelectedWorkspace} />} />
        <Route path="/workspace" element={<Workspace workspacePath={selectedWorkspace} />} />
      </Routes>
    </Router>
  );
}
export default App;
