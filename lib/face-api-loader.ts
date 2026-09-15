// Loads face-api.js models from /public/models once per session.
// Models needed: tiny_face_detector, face_landmark_68, face_recognition
"use client";

import * as faceapi from "face-api.js";

let modelsLoaded = false;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export function isModelsLoaded(): boolean { return modelsLoaded; }

export function matchDescriptor(liveDescriptor: Float32Array, storedDescriptor: number[], threshold = 0.5): boolean {
  const distance = faceapi.euclideanDistance(liveDescriptor, storedDescriptor);
  return distance < threshold;
}

export { faceapi };
