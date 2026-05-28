/* ============================================
   KOALA — Image Compressor Utility
   Client-side image resizing and compression
   using Canvas to prevent memory bloat and API payload limits.
   ============================================ */

/**
 * Converts a File object to a base64 DataURL
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and compresses an image (File or base64) based on system settings.
 * @param {File|string} fileOrBase64 - The input image (File object or DataURL string)
 * @param {Object} options - Custom overrides
 * @returns {Promise<string>} Optimized WebP/JPEG base64 DataURL
 */
export async function compressImage(fileOrBase64, options = {}) {
  // 1. Read settings from localStorage
  const autoOpt = localStorage.getItem('koala_img_auto_optimize') !== 'false';
  if (!autoOpt && !options.force) {
    if (typeof fileOrBase64 === 'string') return fileOrBase64;
    return fileToDataURL(fileOrBase64);
  }

  const qualitySetting = localStorage.getItem('koala_img_quality') || 'premium';

  // 2. Set dimensions and quality based on luxury settings
  let maxDim = 800;
  let encoderQuality = 0.75;

  if (qualitySetting === 'ultrahd') {
    maxDim = 1200;
    encoderQuality = 0.85;
  } else if (qualitySetting === 'standard') {
    maxDim = 600;
    encoderQuality = 0.60;
  }

  // Handle options overrides
  if (options.maxDim) maxDim = options.maxDim;
  if (options.quality) encoderQuality = options.quality;

  // 3. Convert File to DataURL if needed
  const dataUrl = typeof fileOrBase64 === 'string' 
    ? fileOrBase64 
    : await fileToDataURL(fileOrBase64);

  // 4. Do not compress SVGs or non-image assets
  if (dataUrl.startsWith('data:image/svg+xml') || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Keep aspect ratio
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // 5. Compress and output WebP (premium, lightweight)
      // Standard mobile web browsers fallback cleanly to image/jpeg if webp isn't supported
      let outputType = 'image/webp';
      let compressedDataUrl = canvas.toDataURL(outputType, encoderQuality);

      // Verify fallback (if WebP wasn't supported or returned an empty or larger result)
      if (compressedDataUrl.length === 0 || compressedDataUrl.length > dataUrl.length) {
        // Try fallback to standard JPEG
        try {
          compressedDataUrl = canvas.toDataURL('image/jpeg', encoderQuality);
        } catch(e) {
          compressedDataUrl = dataUrl;
        }
      }

      // Resolve final optimized string
      resolve(compressedDataUrl.length < dataUrl.length ? compressedDataUrl : dataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl); // Fallback on error
    };

    img.src = dataUrl;
  });
}
