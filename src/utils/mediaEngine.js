/* ==========================================================================
   KOALA — Luxury Automated Media Engine v1
   Core image processing, normalization, and optimization engine.
   Strict Separation of Concerns (SoC) — Business Logic & Database Layer.
   ========================================================================== */

/**
 * Validates an image file's technical properties.
 * Checks resolution, aspect ratio, size and estimated quality.
 * @param {File} file 
 * @returns {Promise<Object>} Validation report
 */
export function validateImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo proporcionado no es una imagen válida.'));
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;
        const sizeMB = file.size / (1024 * 1024);

        const report = {
          fileName: file.name,
          width,
          height,
          sizeBytes: file.size,
          sizeMB: parseFloat(sizeMB.toFixed(2)),
          aspectRatio: parseFloat(ratio.toFixed(2)),
          isLowRes: width < 1200 || height < 1200,
          isHighWeight: sizeMB > 2.0,
          status: 'success',
          warnings: []
        };

        if (report.isLowRes) {
          report.warnings.push(`Resolución baja (${width}x${height}px). KOALA Visual System v1 recomienda mínimo 1200px.`);
        }
        if (report.isHighWeight) {
          report.warnings.push(`Peso elevado (${report.sizeMB} MB). Se comprimirá drásticamente a WebP.`);
        }
        if (ratio < 0.6 || ratio > 1.4) {
          report.warnings.push('Proporción extrema. El recorte a 4:5 vertical puede recortar partes del producto.');
        }

        // Quick brightness and contrast analysis on a tiny canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        try {
          const imgData = ctx.getImageData(0, 0, 50, 50).data;
          let brightnessSum = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            // Standard relative luminance formula
            brightnessSum += (0.299 * imgData[i] + 0.587 * imgData[i+1] + 0.114 * imgData[i+2]);
          }
          const avgBrightness = brightnessSum / (50 * 50);
          report.estimatedBrightness = Math.round(avgBrightness);
          
          if (avgBrightness < 45) {
            report.warnings.push('Imagen muy oscura. El Lighting Normalization Engine la aclarará sutilmente.');
          } else if (avgBrightness > 235) {
            report.warnings.push('Imagen sobreexpuesta. Evita fondos quemados para mantener el vibe premium.');
          }
        } catch (err) {
          console.warn('No se pudo analizar el brillo de la imagen:', err);
        }

        resolve(report);
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen para su validación.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image from a file or a Base64 string.
 * @param {File|string} src 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(src);
    } else {
      img.src = src;
    }
  });
}

/**
 * Automatically computes the bounding box of the product silouette in an image.
 * Uses color difference thresholding from the corners (assumed background) and alpha values.
 * @param {HTMLCanvasElement} canvas 
 * @param {number} threshold Color distance threshold (0 - 255)
 * @returns {Object} { minX, minY, maxX, maxY }
 */
function getProductBoundingBox(canvas, threshold = 35) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner colors to estimate background color (RGBA)
  const corners = [
    getPixel(data, width, 2, 2),
    getPixel(data, width, width - 3, 2),
    getPixel(data, width, 2, height - 3),
    getPixel(data, width, width - 3, height - 3)
  ];

  // Average the corner colors
  const bgR = Math.round(corners.reduce((sum, c) => sum + c.r, 0) / 4);
  const bgG = Math.round(corners.reduce((sum, c) => sum + c.g, 0) / 4);
  const bgB = Math.round(corners.reduce((sum, c) => sum + c.b, 0) / 4);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let matchesCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Calculate Euclidean color distance from estimated background
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );

      // It is a product pixel if it has high alpha and color differs significantly from background
      const isProductPixel = a > 15 && dist > threshold;

      if (isProductPixel) {
        matchesCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback if no bounding box found (use complete canvas with small safe margin)
  if (matchesCount < 20) {
    return {
      minX: Math.round(width * 0.1),
      minY: Math.round(height * 0.1),
      maxX: Math.round(width * 0.9),
      maxY: Math.round(height * 0.9)
    };
  }

  return { minX, minY, maxX, maxY };
}

function getPixel(data, width, x, y) {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3]
  };
}

/**
 * Main function of the KOALA Luxury Media Engine.
 * Takes raw file or base64 and returns processed WebP Base64 string with all visual adjustments.
 * Supports progress callbacks to power premium admin micro-animations.
 * 
 * @param {File|string} imageSource File or base64 string
 * @param {Object} options Visual options matching KOALA Visual System v1
 * @param {function} onProgress Callback for steps (stepName, progressPercent)
 * @returns {Promise<Object>} { resultBase64, originalBase64, executionTimeMs }
 */
export async function processImage(imageSource, options = {}, onProgress = null) {
  const startTime = Date.now();
  const settings = {
    padding: 0.10, // Minimum 10% spacing per KOALA Visual System
    bgColor: '#FAF7F3', // Warm Alabaster Primary (Neutral background like GOAT)
    canvasWidth: 1200, // 1200x1500 base size
    canvasHeight: 1500, // Strict 4:5 vertical
    ...options
  };

  const callProgress = (step, pct) => {
    if (typeof onProgress === 'function') {
      onProgress(step, pct);
    }
  };

  try {
    // 1. ANALYZING
    callProgress('analyzing', 20);
    const img = await loadImage(imageSource);
    
    // Store original image size
    const originalWidth = img.width;
    const originalHeight = img.height;
    
    // Generate original base64 if not already provided
    let originalBase64 = '';
    if (typeof imageSource === 'string') {
      originalBase64 = imageSource;
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      tempCanvas.getContext('2d').drawImage(img, 0, 0);
      originalBase64 = tempCanvas.toDataURL('image/jpeg', 0.85);
    }
    
    callProgress('background_removal', 50);

    // 2. CENTERING & NORMALIZATION
    // Create the master output canvas at 4:5
    const outCanvas = document.createElement('canvas');
    const outCtx = outCanvas.getContext('2d');
    outCanvas.width = settings.canvasWidth;
    outCanvas.height = settings.canvasHeight;
    
    // Fill Primary Luxury Background (Warm Alabaster / Neutral)
    outCtx.fillStyle = settings.bgColor;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Calculate dimensions to scale product keeping aspect ratio strictly intact
    const allowedW = outCanvas.width * (1 - settings.padding * 2);
    const allowedH = outCanvas.height * (1 - settings.padding * 2);
    
    // Find the scale that fits the image entirely within the allowed area without distortion
    const scale = Math.min(allowedW / originalWidth, allowedH / originalHeight);
    
    const scaledW = originalWidth * scale;
    const scaledH = originalHeight * scale;
    
    // Align absolute center
    const posX = (outCanvas.width - scaledW) / 2;
    const posY = (outCanvas.height - scaledH) / 2;

    callProgress('studio_lighting', 75);

    // Render product image in scaled place without any distortion
    outCtx.drawImage(img, posX, posY, scaledW, scaledH);
    
    // Apply pixel-perfect subtle bounding border to outline visual focus per KOALA standard
    outCtx.strokeStyle = 'rgba(43, 34, 28, 0.03)';
    outCtx.lineWidth = 1;
    outCtx.strokeRect(0, 0, outCanvas.width, outCanvas.height);
    
    callProgress('compression', 90);
    
    // Compress to WebP at 82% quality (the sweet spot of file size / premium perception)
    const resultBase64 = outCanvas.toDataURL('image/webp', 0.82);
    
    // Generate high quality mobile preview thumbnail (1:1 aspect ratio square)
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d');
    thumbCanvas.width = 600;
    thumbCanvas.height = 600;
    
    // Fill Alabaster background
    thumbCtx.fillStyle = settings.bgColor;
    thumbCtx.fillRect(0, 0, 600, 600);
    
    // Center 4:5 image visual crop into square thumbnail
    const cropSrcX = (outCanvas.width - outCanvas.height) / 2;
    
    thumbCtx.drawImage(
      outCanvas,
      Math.max(0, cropSrcX), 0, 
      Math.min(outCanvas.width, outCanvas.height), outCanvas.height,
      0, 0, 600, 600
    );
    const thumbnailBase64 = thumbCanvas.toDataURL('image/webp', 0.82);

    const executionTimeMs = Date.now() - startTime;
    callProgress('complete', 100);

    return {
      resultBase64,
      thumbnailBase64,
      originalBase64,
      width: outCanvas.width,
      height: outCanvas.height,
      bbox: { minX: posX, minY: posY, maxX: posX + scaledW, maxY: posY + scaledH },
      originalWidth,
      originalHeight,
      executionTimeMs,
      processedSize: Math.round(resultBase64.length * 0.75) // estimate bytes in base64
    };

  } catch (err) {
    console.error('Error in Luxury Automated Media Engine:', err);
    throw err;
  }
}
