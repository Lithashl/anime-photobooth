import './App.css';
import React, { useState } from "react";
import Landing from "./components/Landing";
import SelectFrames from "./components/SelectFrames";
import Photobooth from "./components/Photobooth";
import { CameraReelsFill } from "react-bootstrap-icons";
import "./styles/global.css";
import "./styles/animations.css";

function App() {
  const [page, setPage] = useState("landing");
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [bgColor, setBgColor] = useState(null);

  const handleFrameSelect = src => {
    setSelectedFrame(src);
    setPage("booth");
  };

  const handleBackToBooth = () => {
    setSelectedFrame(null);
    setBgColor(null);
    setPage("select");
  };

  return (
    <div
      className={`App${!bgColor ? " app-bg" : ""}`}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...(bgColor ? { background: bgColor, transition: "background 0.4s ease" } : {}),
      }}
    >
      {page !== "landing" && (
        <nav style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 60,
          background: "rgba(10, 2, 20, 0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 122, 162, 0.18)",
          boxSizing: "border-box",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "MakeChoco",
            color: "white",
            fontSize: 20,
            letterSpacing: "0.04em",
            textShadow: "0 0 20px rgba(255,122,162,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <CameraReelsFill size={20} color="#ff7aa2" />
            Anime Photobooth
          </span>
        </nav>
      )}

      <div style={{
        flex: 1,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: page === "landing" ? "center" : "flex-start",
        padding: page === "landing" ? 0 : "32px 24px 48px",
        boxSizing: "border-box",
      }}>
        {page === "landing" && (
          <Landing onStart={() => setPage("select")} />
        )}
        {page === "select" && (
          <SelectFrames onSelect={handleFrameSelect} />
        )}
        {page === "booth" && (
          <Photobooth
            selectedFrame={selectedFrame}
            onBack={handleBackToBooth}
            onBgColorChange={setBgColor}
          />
        )}
      </div>
    </div>
  );
}

export default App;
