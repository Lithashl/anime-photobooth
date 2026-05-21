import React from "react";
import { Stars } from "react-bootstrap-icons";
import "../styles/animations.css";

const features = [
    // { icon: "📸", text: "4 photos" },
    // { icon: "🎨", text: "decorate" },
    // { icon: "✦",  text: "filters" },
    // { icon: "⬇️", text: "save strip" },
];

const decos = [
    { style: { top: "10%",  left: "7%",   fontSize: 36, animationDelay: "0s"   }, char: "✦" },
    { style: { top: "22%",  right: "9%",  fontSize: 22, animationDelay: "1.2s" }, char: "◈" },
    { style: { top: "60%",  left: "5%",   fontSize: 18, animationDelay: "0.6s" }, char: "✧" },
    { style: { bottom: "18%", right: "8%", fontSize: 30, animationDelay: "1.8s" }, char: "✦" },
    { style: { bottom: "35%", left: "12%", fontSize: 14, animationDelay: "0.3s" }, char: "✧" },
    { style: { top: "45%",  right: "5%",  fontSize: 20, animationDelay: "2.4s" }, char: "◈" },
];

export default function Landing({ onStart }) {
    return (
        <div style={styles.page}>
            {decos.map((d, i) => (
                <span
                    key={i}
                    className="float-anim"
                    style={{
                        position: "fixed",
                        color: "rgba(255,122,162,0.35)",
                        pointerEvents: "none",
                        userSelect: "none",
                        zIndex: 0,
                        ...d.style,
                    }}
                >
                    {d.char}
                </span>
            ))}

            <div style={styles.card} className="landing-card-anim">
                <div style={styles.topPill}>
                    <Stars size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    anime photobooth
                    <Stars size={14} style={{ marginLeft: 6, verticalAlign: "middle" }} />
                </div>

                <h1 style={styles.title}>
                    Strike a pose.
                    <br />
                    <span style={styles.titleGradient}>Keep the memory with your Favorite Characters Anime.</span>
                </h1>

                <p style={styles.tagline}>
                    ₊˚ pick a frame · take 4 photos · decorate & save ˚₊
                </p>

                <button
                    className="glow-btn"
                    style={styles.startBtn}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                    }}
                    onClick={onStart}
                >
                    Start →
                </button>

                <div style={styles.featRow}>
                    {features.map(f => (
                        <div key={f.text} style={styles.featPill}>
                            <span>{f.icon}</span>
                            <span>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
    },

    card: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        padding: "52px 72px 48px",
        borderRadius: 32,
        background: "rgba(10, 2, 20, 0.52)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255, 122, 162, 0.28)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
        textAlign: "center",
        maxWidth: 520,
        width: "90%",
        position: "relative",
        zIndex: 1,
    },

    topPill: {
        padding: "6px 22px",
        borderRadius: 50,
        background: "rgba(229, 58, 146, 0.2)",
        border: "1px solid rgba(229, 58, 146, 0.4)",
        color: "#ffb3d1",
        fontFamily: "MakeChoco",
        fontSize: 13,
        letterSpacing: "0.1em",
    },

    title: {
        margin: 0,
        fontSize: 48,
        fontFamily: "MakeChoco",
        color: "white",
        lineHeight: 1.2,
        textShadow: "0 2px 24px rgba(255,122,162,0.3)",
    },

    titleGradient: {
        background: "linear-gradient(135deg, #ff9ab8, #e53a92, #c9a0dc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    tagline: {
        margin: 0,
        fontSize: 15,
        color: "rgba(255,255,255,0.6)",
        fontFamily: "MakeChoco",
        letterSpacing: "0.04em",
    },

    startBtn: {
        padding: "14px 60px",
        fontSize: 22,
        fontFamily: "MakeChoco",
        color: "white",
        border: "none",
        borderRadius: 50,
        background: "linear-gradient(135deg, #ff7aa2, #e53a92)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        marginTop: 4,
    },

    featRow: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 4,
    },

    featPill: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        borderRadius: 50,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        fontFamily: "MakeChoco",
    },
};
