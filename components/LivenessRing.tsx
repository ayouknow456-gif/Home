"use client";

export type RingState =
  | "searching"
  | "detected"
  | "challenge"
  | "verifying"
  | "success"
  | "failed";

const STATE_STYLES: Record<RingState, { stroke: string; dashed: boolean; spin: boolean }> = {
  searching: { stroke: "#9e9e9e", dashed: true, spin: false },
  detected: { stroke: "#f9a825", dashed: false, spin: false },
  challenge: { stroke: "#f9a825", dashed: false, spin: false },
  verifying: { stroke: "#2e7d32", dashed: false, spin: true },
  success: { stroke: "#2e7d32", dashed: false, spin: false },
  failed: { stroke: "#c62828", dashed: false, spin: false },
};

const STATE_LABEL: Record<RingState, string> = {
  searching: "กำลังค้นหาใบหน้า...",
  detected: "เจอใบหน้าแล้ว",
  challenge: "กำลังยืนยันตัวตน",
  verifying: "กำลังตรวจสอบ...",
  success: "ยืนยันสำเร็จ",
  failed: "ยืนยันไม่สำเร็จ",
};

interface LivenessRingProps {
  state: RingState;
  challengeText?: string;
  size?: number;
}

export default function LivenessRing({ state, challengeText, size = 280 }: LivenessRingProps) {
  const style = STATE_STYLES[state];
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={style.spin ? "animate-spin" : ""}
          style={{ animationDuration: "1.4s" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={style.stroke}
            strokeWidth={6}
            strokeDasharray={style.dashed ? "10 8" : circumference}
            strokeDashoffset={state === "success" ? 0 : style.dashed ? 0 : circumference * 0.08}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {state === "success" && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl text-green-700">
            ✓
          </div>
        )}
        {state === "failed" && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl text-red-700">
            ✗
          </div>
        )}
      </div>

      <p className="text-center font-medium text-brand">
        {challengeText && state === "challenge" ? challengeText : STATE_LABEL[state]}
      </p>
    </div>
  );
}
