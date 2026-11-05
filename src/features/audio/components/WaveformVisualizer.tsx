"use client";

import React, { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
  isPaused?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyserNode,
  isRecording,
  isPaused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!isRecording || !analyserNode || isPaused) {
        // Dinlenme / Duraklatma Modu: Zarif bir merkez çizgisi
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)"; // Slate-400
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      // Aktif Kayıt: Frekans çubukları
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      const barCount = 36;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = Math.max(3, (width / barCount) - 3);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * height * 0.85);

        const x = i * (barWidth + 3) + 2;
        const y = (height - barHeight) / 2;

        // Modern gradyan (Indigo -> Violet -> Cyan)
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#6366f1"); // Indigo-500
        gradient.addColorStop(0.5, "#a855f7"); // Purple-500
        gradient.addColorStop(1, "#06b6d4"); // Cyan-500

        ctx.fillStyle = gradient;
        // Yuvarlatılmış çubuklar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isRecording, isPaused]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-inner">
      <canvas
        ref={canvasRef}
        width={380}
        height={72}
        className="w-full max-w-sm h-16"
      />
    </div>
  );
};
