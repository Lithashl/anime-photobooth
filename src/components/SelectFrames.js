import React, { useState } from "react";
import { CheckCircleFill } from "react-bootstrap-icons";

const frameGroups = [
    {
        id: "bnha",
        label: "BNHA",
        // emoji: "💥",
        frames: [
            "/assets/frames/bakugo-frame-1.png",
            "/assets/frames/midoriya-frame.png",
            "/assets/frames/shoto-frame.png",
        ],
    },
    {
        id: "jjk",
        label: "JJK",
        // emoji: "👁️",
        frames: [
            "/assets/frames/gojo-frame.png",
        ],
    },
];

export default function SelectFrames({ onSelect }) {
    const [activeGroup, setActiveGroup] = useState(frameGroups[0].id);
    const [hoveredFrame, setHoveredFrame] = useState(null);

    const currentFrames = frameGroups.find(g => g.id === activeGroup)?.frames ?? [];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.titleArea}>
                    <h1 style={styles.title}>₊✩ Select a Frame ✩₊</h1>
                    <p style={styles.subtitle}>choose your anime universe</p>
                </div>

                <div style={styles.tabRow}>
                    {frameGroups.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setActiveGroup(g.id)}
                            style={{
                                ...styles.tab,
                                ...(activeGroup === g.id ? styles.tabActive : styles.tabInactive),
                            }}
                        >
                            <span>{g.emoji}</span>
                            <span>{g.label}</span>
                        </button>
                    ))}
                </div>

                <div style={styles.grid}>
                    {currentFrames.length === 0 ? (
                        <div style={styles.empty}>
                            <p style={styles.emptyText}>No frames yet ˙◠˙</p>
                            <p style={styles.emptyHint}>Check back soon!</p>
                        </div>
                    ) : (
                        currentFrames.map((src, i) => (
                            <div
                                key={src}
                                style={{
                                    ...styles.frameCard,
                                    ...(hoveredFrame === i ? styles.frameCardHover : {}),
                                }}
                                onMouseEnter={() => setHoveredFrame(i)}
                                onMouseLeave={() => setHoveredFrame(null)}
                                onClick={() => onSelect(src)}
                            >
                                <img src={src} alt={`frame ${i + 1}`} style={styles.frameImg} />
                                <div style={{
                                    ...styles.frameOverlay,
                                    opacity: hoveredFrame === i ? 1 : 0,
                                }}>
                                    <span style={styles.selectText}>
                                        <CheckCircleFill size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                                        Select
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    },

    card: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        padding: "44px 52px 52px",
        borderRadius: 28,
        background: "rgba(10, 2, 20, 0.52)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255, 122, 162, 0.22)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
        maxWidth: 800,
        width: "100%",
        boxSizing: "border-box",
    },

    titleArea: {
        textAlign: "center",
    },

    title: {
        margin: "0 0 8px 0",
        fontFamily: "MakeChoco",
        color: "white",
        fontSize: 30,
        textShadow: "0 2px 20px rgba(255,122,162,0.45)",
    },

    subtitle: {
        margin: 0,
        fontFamily: "MakeChoco",
        color: "rgba(255,255,255,0.45)",
        fontSize: 14,
        letterSpacing: "0.08em",
    },

    tabRow: {
        display: "flex",
        gap: 12,
    },

    tab: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 32px",
        fontSize: 17,
        fontFamily: "MakeChoco",
        borderRadius: 50,
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
    },

    tabActive: {
        background: "linear-gradient(135deg, #ff7aa2, #e53a92)",
        color: "white",
        border: "2px solid rgba(255,122,162,0.5)",
        boxShadow: "0 6px 22px rgba(229,58,146,0.45)",
    },

    tabInactive: {
        background: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.6)",
        border: "2px solid rgba(255,255,255,0.15)",
    },

    grid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "center",
        minHeight: 180,
    },

    frameCard: {
        position: "relative",
        width: 190,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
        border: "2px solid rgba(255,255,255,0.12)",
    },

    frameCardHover: {
        transform: "scale(1.07) translateY(-6px)",
        boxShadow: "0 24px 56px rgba(229,58,146,0.55)",
        border: "2px solid rgba(255,122,162,0.7)",
    },

    frameImg: {
        width: "100%",
        display: "block",
    },

    frameOverlay: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(180, 30, 100, 0.6)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        transition: "opacity 0.2s ease",
    },

    selectText: {
        fontFamily: "MakeChoco",
        color: "white",
        fontSize: 18,
        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        letterSpacing: "0.05em",
    },

    empty: {
        textAlign: "center",
        padding: "40px 0",
    },

    emptyText: {
        fontFamily: "MakeChoco",
        color: "rgba(255,255,255,0.65)",
        fontSize: 20,
        margin: "0 0 8px 0",
    },

    emptyHint: {
        fontFamily: "MakeChoco",
        color: "rgba(255,255,255,0.35)",
        fontSize: 14,
        margin: 0,
    },
};
