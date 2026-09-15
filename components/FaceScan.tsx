"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { loadFaceModels, faceapi } from "@/lib/face-api-loader";
import LivenessRing, { RingState } from "./LivenessRing";

type Challenge = "หันซ้าย" | "หันขวา" | "พยักหน้า";
const CHALLENGES: Challenge[] = ["หันซ้าย", "หันขวา", "พยักหน้า"];
const YAW_THRESHOLD_DEG = 15;
const PITCH_THRESHOLD_DEG = 10;
const TIMEOUT_MS = 30_000;
const DETECT_INTERVAL_MS = 100;

interface FaceScanProps {
  onSuccess: (descriptor: Float32Array) => void;
  onFail?: () => void;
}

export default function FaceScan({ onSuccess, onFail }: FaceScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ringState, setRingState] = useState<RingState>("searching");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const challengeStartYaw = useRef<number | null>(null);
  const challengeStartPitch = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      await loadFaceModels();
      if (cancelled) return;
      setModelsReady(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480, facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      timeoutRef.current = setTimeout(() => {
        setRingState("failed");
        cleanup();
        onFail?.();
      }, TIMEOUT_MS);
      setChallenge(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
      intervalRef.current = setInterval(detectLoop, DETECT_INTERVAL_MS);
    }

    async function detectLoop() {
      if (!videoRef.current) return;
      const result = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!result) {
        setRingState((prev) => (prev === "verifying" || prev === "challenge" ? prev : "searching"));
        return;
      }
      setRingState((prev) => (prev === "searching" ? "detected" : prev));
      const landmarks = result.landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();
      const noseTip = nose[3];
      const eyeMidX = (leftEye[0].x + rightEye[3].x) / 2;
      const eyeMidY = (leftEye[0].y + rightEye[3].y) / 2;
      const mouthMidY = (mouth[3].y + mouth[9].y) / 2;
      const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
      const faceHeight = Math.abs(mouthMidY - eyeMidY);
      const yawEstimate = ((noseTip.x - eyeMidX) / (faceWidth || 1)) * 90;
      const pitchEstimate = ((noseTip.y - eyeMidY) / (faceHeight || 1) - 0.5) * 90;
      if (challengeStartYaw.current === null) {
        challengeStartYaw.current = yawEstimate;
        challengeStartPitch.current = pitchEstimate;
        setRingState("challenge");
        return;
      }
      const yawDelta = yawEstimate - challengeStartYaw.current;
      const pitchDelta = pitchEstimate - challengeStartPitch.current;
      let challengePassed = false;
      if (challenge === "หันซ้าย" && yawDelta < -YAW_THRESHOLD_DEG) challengePassed = true;
      if (challenge === "หันขวา" && yawDelta > YAW_THRESHOLD_DEG) challengePassed = true;
      if (challenge === "พยักหน้า" && Math.abs(pitchDelta) > PITCH_THRESHOLD_DEG) challengePassed = true;
      if (challengePassed) {
        setRingState("verifying");
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTimeout(() => {
          setRingState("success");
          cleanup();
          onSuccess(result.descriptor);
        }, 500);
      }
    }

    setup().catch(() => {
      setRingState("failed");
      cleanup();
      onFail?.();
    });
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative overflow-hidden rounded-full border-4 border-brand" style={{ width: 280, height: 280 }}>
        <video ref={videoRef} muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
        <div className="absolute inset-0"><LivenessRing state={ringState} challengeText={challenge ? `กรุณา${challenge}` : undefined} /></div>
      </div>
      {!modelsReady && <p className="text-sm text-gray-500">กำลังโหลดโมเดล...</p>}
    </div>
  );
}
