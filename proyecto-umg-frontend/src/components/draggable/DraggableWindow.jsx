import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import "./DraggableWindow.css";

export const DraggableWindow = forwardRef(function DraggableWindow(
    { isOpen, onClose, title = "Floating window", width = 520, height = 360, children },
    ref
) {
    const panelRef = useRef(null);
    const handleRef = useRef(null);
    const swalTargetRef = useRef(null);

    const [mounted, setMounted] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ dx: 0, dy: 0 });

    useImperativeHandle(ref, () => ({
        getSwalTarget: () => swalTargetRef.current
    }));

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!isOpen) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const w = Math.min(width, vw - 16);
        const h = Math.min(height, vh - 16);
        setPos({ x: (vw - w) / 2, y: (vh - h) / 2 });
    }, [isOpen, width, height]);

    const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

    useEffect(() => {
        const handle = handleRef.current;
        if (!handle || !isOpen) return;

        const onPointerDown = (e) => {
            if (e.target.closest("[data-no-drag]")) return;
            const isPrimary = e.pointerType === "mouse" ? e.button === 0 : true;
            if (!isPrimary) return;
            panelRef.current?.setPointerCapture?.(e.pointerId);
            const rect = panelRef.current.getBoundingClientRect();
            setOffset({ dx: e.clientX - rect.left, dy: e.clientY - rect.top });
            setDragging(true);
            e.preventDefault();
        };
        const onPointerMove = (e) => {
            if (!dragging || !panelRef.current) return;
            const vw = window.innerWidth, vh = window.innerHeight;
            const rect = panelRef.current.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            const nx = clamp(e.clientX - offset.dx, 8, vw - w - 8);
            const ny = clamp(e.clientY - offset.dy, 8, vh - h - 8);
            setPos({ x: nx, y: ny });
        };
        const onPointerUp = (e) => {
            setDragging(false);
            panelRef.current?.releasePointerCapture?.(e.pointerId);
        };

        handle.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            handle.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [dragging, offset.dx, offset.dy, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    const node = (
        <div className="floating-overlay">
            <div
                ref={panelRef}
                className={`floating-window ${dragging ? "is-dragging" : ""}`}
                role="dialog"
                aria-modal="false"
                aria-label={title}
                style={{ width, height, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
            >
                <div ref={handleRef} className="floating-handle">
                    <div className="floating-title">{title}</div>
                    <button type="button" className="btn-close" aria-label="Close" data-no-drag onClick={onClose} />
                </div>

                <div className="floating-body">
                    {children}
                    <div ref={swalTargetRef} className="floating-swal-target" />
                </div>
            </div>
        </div>
    );

    return createPortal(node, document.body);
});