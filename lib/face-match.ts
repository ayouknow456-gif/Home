// Plain Euclidean distance between two 128-dim face descriptors.
// Dependency-free so it is safe to use in server-side API routes.
export function euclideanDistance(a: Float32Array | number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < b.length; i++) {
    const diff = (a[i] ?? 0) - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
