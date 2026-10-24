/**
 * Biometric Face Capture Utilities
 * Crops video streams strictly to the central targeting square (Region of Interest - ROI)
 * before sending to face recognition engine. This prevents side bystanders and coworkers
 * from appearing in the image payload and causing identity conflicts.
 */

/**
 * Extracts a square snapshot from the center of the video element.
 * @param {HTMLVideoElement} video - The active video element
 * @param {number} scaleFactor - Proportion of smaller dimension to crop (default 0.85)
 * @param {number} outputSize - Output square canvas dimensions in pixels (default 480)
 * @returns {string|null} - Base64 JPEG data URL or null if video is not ready
 */
export function captureSquareSnapshot(video, scaleFactor = 0.85, outputSize = 480) {
  if (!video || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  const vW = video.videoWidth;
  const vH = video.videoHeight;

  // Calculate square size based on the smaller dimension (e.g. height on landscape 4:3 or 16:9)
  const cropSize = Math.floor(Math.min(vW, vH) * scaleFactor);

  // Center the crop horizontally and vertically
  const startX = Math.floor((vW - cropSize) / 2);
  const startY = Math.floor((vH - cropSize) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Draw strictly the center square ROI
  ctx.drawImage(
    video,
    startX,
    startY,
    cropSize,
    cropSize,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}
