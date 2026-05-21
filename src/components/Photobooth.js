import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import {
    CameraFill,
    CloudUploadFill,
    ArrowCounterclockwise,
    CameraVideoFill,
    Brush,
    Download,
    ArrowLeft,
    DiamondFill,
} from "react-bootstrap-icons";

const stickerOptions = [
    "/assets/stickers/leaf.png",
    "/assets/stickers/sparkles.png"
];

const filterOptions = [
    { label: "None",    value: "none",    css: "" },
    { label: "Vivid",   value: "vivid",   css: "saturate(1.8) contrast(1.1)" },
    { label: "Soft",    value: "soft",    css: "brightness(1.12) saturate(0.75)" },
    { label: "B&W",     value: "bw",      css: "grayscale(1)" },
    { label: "Warm",    value: "warm",    css: "sepia(0.45) saturate(1.3) brightness(1.05)" },
    { label: "Cool",    value: "cool",    css: "hue-rotate(30deg) saturate(1.15)" },
    { label: "Vintage", value: "vintage", css: "sepia(0.65) contrast(1.1) brightness(0.92)" },
];

const bgColorOptions = [
    { label: "none",     hex: null },
    { label: "pink",     hex: "#ff9ab8" },
    { label: "lavender", hex: "#c9a0dc" },
    { label: "blue",     hex: "#90c8f0" },
    { label: "mint",     hex: "#96ddbf" },
    { label: "peach",    hex: "#ffbe96" },
    { label: "lemon",    hex: "#f5e17a" },
    { label: "red",      hex: "#ff8080" },
];

const videoConstraints = { width: 960, height: 640, facingMode: "user" };
const SLOT_WIDTH = 567;
const SLOT_HEIGHT = 373;
const slots = [
    { x: 70, y: 57 },
    { x: 70, y: 514 },
    { x: 70, y: 971 },
    { x: 70, y: 1428 }
];

export default function PhotoBooth({ selectedFrame, onBack, onBgColorChange }) {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const frameImgRef = useRef(null);

    const [mode, setMode] = useState("photo");
    const [photos, setPhotos] = useState([]);
    const [photoCount, setPhotoCount] = useState(0);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [draggingPhoto, setDraggingPhoto] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [countdown, setCountdown] = useState(null);

    const photoCountRef = useRef(0);
    const captureIntervalRef = useRef(null);
    const captureTimeoutRef = useRef(null);

    const [stickers, setStickers] = useState([]);
    const [draggingSticker, setDraggingSticker] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("none");
    const [bgColor, setBgColor] = useState(null);

    const handleBgColor = hex => {
        setBgColor(hex);
        onBgColorChange?.(hex);
    };

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !frameImgRef.current) return;

        const ctx = canvas.getContext("2d");
        const frameWidth = frameImgRef.current.width;
        const frameHeight = frameImgRef.current.height;
        canvas.width = frameWidth;
        canvas.height = frameHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const activeFilter = filterOptions.find(f => f.value === selectedFilter)?.css ?? "";

        photos.forEach(p => {
            const slot = slots[p.slotIndex];
            const drawW = p.img.width * p.scale;
            const drawH = p.img.height * p.scale;
            const dx = slot.x + p.offsetX;
            const dy = slot.y + p.offsetY;

            ctx.save();
            ctx.beginPath();
            ctx.rect(slot.x, slot.y, SLOT_WIDTH, SLOT_HEIGHT);
            ctx.clip();
            if (activeFilter) ctx.filter = activeFilter;
            ctx.drawImage(p.img, dx, dy, drawW, drawH);
            ctx.restore();
        });

        ctx.drawImage(frameImgRef.current, 0, 0, frameWidth, frameHeight);

        stickers.forEach((s, i) => {
            ctx.drawImage(s.img, s.x, s.y, 150, 150);
            if (i === selectedSticker) {
                ctx.strokeStyle = "#ff7aa2";
                ctx.lineWidth = 4;
                ctx.strokeRect(s.x, s.y, 150, 150);
            }
        });
    }, [selectedFilter, photos, stickers, selectedSticker]);

    useEffect(() => {
        if (!selectedFrame) return;
        const img = new Image();
        img.src = selectedFrame;
        img.onload = () => {
            frameImgRef.current = img;
            drawCanvas();
        };
    }, [selectedFrame, drawCanvas]);

    useEffect(drawCanvas, [drawCanvas]);

    const handleBack = () => {
        if (mode === "decorate") {
            setMode("photo");
            setStickers([]);
            setSelectedSticker(null);
            setSelectedFilter("none");
        } else {
            onBack();
        }
    };

    // Used by upload — adds one photo at current slot index
    const addPhoto = img => {
        const slotIndex = photoCountRef.current;
        if (slotIndex >= 4) return;
        const scale = SLOT_WIDTH / img.width;
        const drawH = img.height * scale;
        const offsetY = drawH > SLOT_HEIGHT ? (SLOT_HEIGHT - drawH) / 2 : 0;
        setPhotos(p => [...p, { img, slotIndex, scale, offsetX: 0, offsetY }]);
        const next = slotIndex + 1;
        photoCountRef.current = next;
        setPhotoCount(next);
        if (next >= 4) setMode("decorate");
    };

    const cancelCapture = () => {
        clearInterval(captureIntervalRef.current);
        clearTimeout(captureTimeoutRef.current);
        setIsAutoCapturing(false);
        setCountdown(null);
    };

    const runCapture = (slotIndex) => {
        if (slotIndex >= 4) {
            setIsAutoCapturing(false);
            return;
        }
        setCountdown(3);
        let current = 3;
        captureIntervalRef.current = setInterval(() => {
            current -= 1;
            if (current === 0) {
                clearInterval(captureIntervalRef.current);
                setCountdown(null);
                const src = webcamRef.current?.getScreenshot();
                if (!src) { setIsAutoCapturing(false); return; }
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    const scale = SLOT_WIDTH / img.width;
                    const drawH = img.height * scale;
                    const offsetY = drawH > SLOT_HEIGHT ? (SLOT_HEIGHT - drawH) / 2 : 0;
                    setPhotos(prev => [...prev, { img, slotIndex, scale, offsetX: 0, offsetY }]);
                    const next = slotIndex + 1;
                    photoCountRef.current = next;
                    setPhotoCount(next);
                    if (next >= 4) {
                        setIsAutoCapturing(false);
                        setMode("decorate");
                    } else {
                        captureTimeoutRef.current = setTimeout(() => runCapture(next), 800);
                    }
                };
            } else {
                setCountdown(current);
            }
        }, 1000);
    };

    const startAutoCapture = () => {
        if (isAutoCapturing || photoCountRef.current >= 4) return;
        setIsAutoCapturing(true);
        runCapture(photoCountRef.current);
    };

    useEffect(() => () => {
        clearInterval(captureIntervalRef.current);
        clearTimeout(captureTimeoutRef.current);
    }, []);

    const uploadPhoto = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => addPhoto(img);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const redoLastPhoto = () => {
        cancelCapture();
        if (!photos.length) return;
        setPhotos(p => p.slice(0, -1));
        const newCount = Math.max(0, photoCountRef.current - 1);
        photoCountRef.current = newCount;
        setPhotoCount(newCount);
    };

    const getCoords = e => {
        const r = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
            y: (e.clientY - r.top) * (canvasRef.current.height / r.height)
        };
    };

    const handleMouseDown = e => {
        const { x, y } = getCoords(e);
        if (mode === "photo") {
            for (let i = photos.length - 1; i >= 0; i--) {
                const p = photos[i];
                const slot = slots[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;
                if (x >= slot.x + p.offsetX && x <= slot.x + p.offsetX + w &&
                    y >= slot.y + p.offsetY && y <= slot.y + p.offsetY + h) {
                    setDraggingPhoto(i);
                    setDragOffset({ x: x - slot.x - p.offsetX, y: y - slot.y - p.offsetY });
                    return;
                }
            }
        }
        if (mode === "decorate") {
            for (let i = stickers.length - 1; i >= 0; i--) {
                const s = stickers[i];
                if (x >= s.x && x <= s.x + 150 && y >= s.y && y <= s.y + 150) {
                    setDraggingSticker(i);
                    setSelectedSticker(i);
                    setDragOffset({ x: x - s.x, y: y - s.y });
                    return;
                }
            }
        }
    };

    const handleMouseMove = e => {
        const { x, y } = getCoords(e);
        if (draggingPhoto !== null && mode === "photo") {
            setPhotos(prev => {
                const updated = [...prev];
                const p = updated[draggingPhoto];
                const slot = slots[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;
                p.offsetX = Math.min(Math.max(x - slot.x - dragOffset.x, SLOT_WIDTH - w), 0);
                p.offsetY = Math.min(Math.max(y - slot.y - dragOffset.y, SLOT_HEIGHT - h), 0);
                return updated;
            });
        }
        if (draggingSticker != null && mode === "decorate") {
            setStickers(s => {
                const u = [...s];
                u[draggingSticker] = { ...u[draggingSticker], x: x - dragOffset.x, y: y - dragOffset.y };
                return u;
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingPhoto(null);
        setDraggingSticker(null);
    };

    const addSticker = src => {
        const img = new Image();
        img.src = src;
        img.onload = () => setStickers(s => [...s, { img, x: 400, y: 100 }]);
    };

    useEffect(() => {
        const handleKeyDown = e => {
            if ((e.key === "Delete" || e.key === "Backspace") &&
                selectedSticker != null && mode === "decorate") {
                setStickers(s => s.filter((_, i) => i !== selectedSticker));
                setSelectedSticker(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedSticker, mode]);

    const downloadPhoto = () => {
        const a = document.createElement("a");
        a.href = canvasRef.current.toDataURL("image/png");
        a.download = "photo-strip.png";
        a.click();
    };

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* header */}
                <div style={s.header}>
                    <button
                        style={s.backBtn}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        onClick={handleBack}
                    >
                        <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        back
                    </button>
                    <h1 style={s.title}>
                        {mode === "photo" ? "⋆｡‧˚ʚ smile :) ɞ˚‧｡⋆" : "✦ let's decorate ✦"}
                    </h1>
                    <div style={{ width: 90 }} />
                </div>

                {/* mode indicator */}
                <div style={s.modeBar}>
                    <div style={{ ...s.modeStep, ...(mode === "photo" ? s.modeStepActive : s.modeStepDone) }}>
                        <CameraVideoFill size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
                        shoot
                    </div>
                    <div style={s.modeLine} />
                    <div style={{ ...s.modeStep, ...(mode === "decorate" ? s.modeStepActive : {}) }}>
                        <Brush size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
                        decorate
                    </div>
                </div>

                {/* body */}
                <div style={s.body}>

                    {/* left panel */}
                    <div style={s.leftPanel}>
                        {mode === "photo" && (
                            <>
                                <div style={s.camWrap}>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/png"
                                        videoConstraints={videoConstraints}
                                        mirrored={true}
                                        style={{ width: "100%", display: "block", borderRadius: 14 }}
                                    />
                                    {(() => {
                                        const scale = 380 / SLOT_WIDTH;
                                        const slotY = photoCount < slots.length ? slots[photoCount].y : slots[slots.length - 1].y;
                                        return (
                                            <img
                                                src={selectedFrame}
                                                alt=""
                                                style={{
                                                    position: "absolute",
                                                    pointerEvents: "none",
                                                    width: 707 * scale,
                                                    top: -(slotY * scale),
                                                    left: -(70 * scale),
                                                }}
                                            />
                                        );
                                    })()}
                                    {countdown != null && (
                                        <div style={s.countdownOverlay}>
                                            <span style={{ fontSize: 88, fontWeight: "bold", lineHeight: 1 }}>{countdown}</span>
                                            <span style={{ fontSize: 14, fontFamily: "MakeChoco", marginTop: 10, opacity: 0.9, letterSpacing: "0.06em" }}>
                                                photo {photoCount + 1} of 4
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* background color */}
                                <div style={s.section}>
                                    <p style={s.sectionLabel}><DiamondFill size={9} style={{ marginRight: 6, verticalAlign: "middle" }} />background color</p>
                                    <div style={s.colorRow}>
                                        {bgColorOptions.map(opt => (
                                            <button
                                                key={opt.label}
                                                title={opt.label}
                                                onClick={() => handleBgColor(opt.hex)}
                                                style={{
                                                    ...s.colorSwatch,
                                                    background: opt.hex ?? "rgba(255,255,255,0.1)",
                                                    border: bgColor === opt.hex
                                                        ? "3px solid white"
                                                        : opt.hex
                                                            ? `3px solid ${opt.hex}bb`
                                                            : "3px solid rgba(255,255,255,0.3)",
                                                    boxShadow: bgColor === opt.hex
                                                        ? `0 0 0 2px rgba(0,0,0,0.3), 0 0 0 4px ${opt.hex ?? "#ff7aa2"}`
                                                        : "none",
                                                    transform: bgColor === opt.hex ? "scale(1.15)" : "scale(1)",
                                                }}
                                            >
                                                {!opt.hex && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>✕</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* progress */}
                                <div style={s.section}>
                                    <p style={s.sectionLabel}><DiamondFill size={9} style={{ marginRight: 6, verticalAlign: "middle" }} />photo {Math.min(photoCount + 1, 4)} of 4</p>
                                    <div style={s.dots}>
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} style={{
                                                ...s.dot,
                                                ...(i < photoCount ? s.dotFilled : {}),
                                            }}>
                                                <span style={{ fontSize: 11, fontFamily: "MakeChoco", color: i < photoCount ? "white" : "rgba(255,255,255,0.3)" }}>
                                                    {i + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* action buttons */}
                                <div style={s.btnRow}>
                                    {!isAutoCapturing && photoCount < 4 && (
                                        <>
                                            <button
                                                style={s.primaryBtn}
                                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,58,146,0.55)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,58,146,0.4)"; }}
                                                onClick={startAutoCapture}
                                            >
                                                <CameraFill size={15} style={{ marginRight: 7, verticalAlign: "middle" }} />
                                                take photo
                                            </button>
                                            <label
                                                style={{ ...s.secondaryBtn, cursor: "pointer" }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                                            >
                                                <CloudUploadFill size={15} style={{ marginRight: 7, verticalAlign: "middle" }} />
                                                upload
                                                <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
                                            </label>
                                        </>
                                    )}
                                    {isAutoCapturing && (
                                        <button
                                            style={s.cancelBtn}
                                            onClick={cancelCapture}
                                        >
                                            cancel
                                        </button>
                                    )}
                                    {photoCount > 0 && !isAutoCapturing && (
                                        <button
                                            style={s.iconBtn}
                                            onClick={redoLastPhoto}
                                            title="Redo last photo"
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                                        >
                                            <ArrowCounterclockwise size={18} />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {mode === "decorate" && (
                            <div style={s.decoratePanel}>
                                <div style={s.sectionCard}>
                                    <p style={s.sectionLabel}><DiamondFill size={9} style={{ marginRight: 6, verticalAlign: "middle" }} />stickers</p>
                                    <div style={s.stickerRow}>
                                        {stickerOptions.map(src => (
                                            <div
                                                key={src}
                                                style={s.stickerBtn}
                                                onClick={() => addSticker(src)}
                                                onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(255,122,162,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                                            >
                                                <img src={src} alt="sticker" style={{ width: 44, height: 44, objectFit: "contain" }} />
                                            </div>
                                        ))}
                                    </div>
                                    <p style={s.hint}>click to add · drag on strip · delete/backspace to remove</p>
                                </div>

                                <div style={s.sectionCard}>
                                    <p style={s.sectionLabel}><DiamondFill size={9} style={{ marginRight: 6, verticalAlign: "middle" }} />filters</p>
                                    <div style={s.filterGrid}>
                                        {filterOptions.map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setSelectedFilter(f.value)}
                                                style={{
                                                    ...s.filterChip,
                                                    background: selectedFilter === f.value
                                                        ? "linear-gradient(135deg, #ff7aa2, #e53a92)"
                                                        : "rgba(255,255,255,0.07)",
                                                    color: selectedFilter === f.value ? "white" : "rgba(255,255,255,0.65)",
                                                    border: selectedFilter === f.value
                                                        ? "2px solid rgba(255,122,162,0.5)"
                                                        : "2px solid rgba(255,255,255,0.15)",
                                                    boxShadow: selectedFilter === f.value
                                                        ? "0 4px 14px rgba(229,58,146,0.35)"
                                                        : "none",
                                                }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    style={s.downloadBtn}
                                    onClick={downloadPhoto}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(155,89,182,0.55)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(155,89,182,0.4)"; }}
                                >
                                    <Download size={15} style={{ marginRight: 7, verticalAlign: "middle" }} />
                                    save photo strip
                                </button>
                            </div>
                        )}
                    </div>

                    {/* right panel — photo strip */}
                    <div style={s.stripWrap}>
                        <p style={s.stripLabel}><DiamondFill size={9} style={{ marginRight: 6, verticalAlign: "middle" }} />preview</p>
                        <div style={s.stripInner}>
                            <canvas
                                ref={canvasRef}
                                style={s.canvas}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
    },

    card: {
        background: "rgba(10, 2, 20, 0.52)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRadius: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        border: "1px solid rgba(255, 122, 162, 0.2)",
        padding: "28px 32px 36px",
        width: "100%",
        maxWidth: 860,
        boxSizing: "border-box",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    backBtn: {
        padding: "8px 20px",
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "MakeChoco",
        color: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 50,
        background: "rgba(255,255,255,0.08)",
        transition: "background 0.15s",
        width: 90,
    },

    title: {
        margin: 0,
        fontSize: 18,
        textAlign: "center",
        color: "white",
        fontFamily: "MakeChoco",
        letterSpacing: "0.02em",
        textShadow: "0 2px 16px rgba(255,122,162,0.45)",
    },

    modeBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 20,
    },

    modeStep: {
        padding: "6px 20px",
        borderRadius: 50,
        fontFamily: "MakeChoco",
        fontSize: 13,
        letterSpacing: "0.04em",
        transition: "all 0.2s",
    },

    modeStepActive: {
        background: "linear-gradient(135deg, #ff7aa2, #e53a92)",
        color: "white",
        boxShadow: "0 4px 16px rgba(229,58,146,0.4)",
    },

    modeStepDone: {
        background: "rgba(255,122,162,0.15)",
        color: "rgba(255,122,162,0.7)",
        border: "1px solid rgba(255,122,162,0.25)",
    },

    modeLine: {
        width: 40,
        height: 1,
        background: "rgba(255,122,162,0.3)",
        margin: "0 4px",
    },

    body: {
        display: "flex",
        gap: 28,
        alignItems: "flex-start",
    },

    leftPanel: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
    },

    camWrap: {
        position: "relative",
        width: "100%",
        maxWidth: 380,
        overflow: "hidden",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        border: "2px solid rgba(255,122,162,0.25)",
    },

    countdownOverlay: {
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "white",
        textShadow: "0 4px 24px rgba(0,0,0,0.6)",
        background: "rgba(180,30,100,0.35)",
        backdropFilter: "blur(4px)",
        borderRadius: 14,
        pointerEvents: "none",
    },

    section: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: "12px 16px",
    },

    sectionLabel: {
        margin: "0 0 10px 0",
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
        fontFamily: "MakeChoco",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },

    dots: {
        display: "flex",
        gap: 10,
        alignItems: "center",
    },

    dot: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        border: "2px solid rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.25s ease",
    },

    dotFilled: {
        background: "linear-gradient(135deg, #ff7aa2, #e53a92)",
        border: "2px solid rgba(255,122,162,0.6)",
        boxShadow: "0 4px 14px rgba(229,58,146,0.4)",
    },

    btnRow: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
    },

    primaryBtn: {
        padding: "11px 24px",
        fontSize: 15,
        cursor: "pointer",
        fontFamily: "MakeChoco",
        color: "white",
        border: "none",
        borderRadius: 50,
        background: "linear-gradient(135deg, #ff7aa2, #e53a92)",
        boxShadow: "0 6px 20px rgba(229,58,146,0.4)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },

    secondaryBtn: {
        padding: "11px 24px",
        fontSize: 15,
        fontFamily: "MakeChoco",
        color: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 50,
        background: "rgba(255,255,255,0.08)",
        transition: "background 0.15s",
        display: "inline-block",
    },

    cancelBtn: {
        padding: "11px 24px",
        fontSize: 15,
        cursor: "pointer",
        fontFamily: "MakeChoco",
        color: "rgba(255,200,200,0.85)",
        border: "1px solid rgba(255,120,120,0.35)",
        borderRadius: 50,
        background: "rgba(200,60,60,0.18)",
        transition: "background 0.15s",
    },

    iconBtn: {
        width: 44,
        height: 44,
        fontSize: 20,
        cursor: "pointer",
        color: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "background 0.15s",
    },

    decoratePanel: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        maxWidth: 380,
    },

    sectionCard: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 18,
        padding: "14px 16px",
    },

    stickerRow: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },

    stickerBtn: {
        width: 64,
        height: 64,
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 14,
        background: "rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
    },

    hint: {
        margin: "10px 0 0 0",
        fontSize: 11,
        color: "rgba(255,255,255,0.3)",
        fontFamily: "MakeChoco",
    },

    filterGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
    },

    filterChip: {
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "MakeChoco",
        borderRadius: 50,
        transition: "all 0.15s ease",
    },

    downloadBtn: {
        padding: "13px 0",
        fontSize: 16,
        cursor: "pointer",
        fontFamily: "MakeChoco",
        color: "white",
        border: "none",
        borderRadius: 50,
        background: "linear-gradient(135deg, #c9a0dc, #9b59b6)",
        boxShadow: "0 6px 20px rgba(155,89,182,0.4)",
        width: "100%",
        marginTop: 4,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },

    stripWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
    },

    stripLabel: {
        margin: 0,
        fontSize: 12,
        color: "rgba(255,255,255,0.45)",
        fontFamily: "MakeChoco",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },

    stripInner: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,122,162,0.2)",
        borderRadius: 20,
        padding: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },

    canvas: {
        width: 200,
        height: 500,
        borderRadius: 12,
        display: "block",
    },

    colorRow: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
    },

    colorSwatch: {
        width: 30,
        height: 30,
        borderRadius: "50%",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },
};
