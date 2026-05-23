/* ==========================================================================
   KOALA — Universal AI Product Normalization System
   Powered by @imgly/background-removal (Local WASM)
   Strict Separation of Concerns (SoC) — Business Logic & Database Layer.
   ========================================================================== */

import { removeBackground } from '@imgly/background-removal';

/**
 * Validates an image file's technical properties.
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
 * Loads an image from a file, Blob or a Base64 string.
 * @param {File|Blob|string} src 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    if (src instanceof Blob || src instanceof File) {
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
 * Finds the exact bounding box of the isolated object via Alpha Channel.
 * @param {HTMLCanvasElement} canvas 
 * @returns {Object} { minX, minY, maxX, maxY, objectWidth, objectHeight }
 */
function getAlphaBoundingBox(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let matchesCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        matchesCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (matchesCount === 0) {
    return { minX: 0, minY: 0, maxX: width, maxY: height, objectWidth: width, objectHeight: height };
  }

  return { minX, minY, maxX, maxY, objectWidth: maxX - minX, objectHeight: maxY - minY };
}

/**
 * Main function of the KOALA Universal AI Media Engine.
 * 
 * @param {File|string} imageSource File or base64 string
 * @param {Object} options Visual options matching KOALA Visual System v1
 * @param {function} onProgress Callback for steps (stepName, progressPercent)
 * @returns {Promise<Object>} { resultBase64, originalBase64, executionTimeMs }
 */
export async function processImage(imageSource, options = {}, onProgress = null) {
  const startTime = Date.now();
  const settings = {
    padding: 0.10, // 10% base padding
    bgColor: '#FAF7F3', // Warm Alabaster Primary
    shadowOpacity: 0.15,
    autoBackgroundRemoval: true,
    canvasWidth: 1200,
    canvasHeight: 1500, // 4:5 vertical
    ...options
  };

  const callProgress = (step, pct) => {
    if (typeof onProgress === 'function') onProgress(step, pct);
  };

  try {
    // 1. ANALYZING & ORIGINAL EXTRACTION
    callProgress('analyzing', 10);
    const originalImg = await loadImage(imageSource);
    
    let originalBase64 = '';
    if (typeof imageSource === 'string') {
      originalBase64 = imageSource;
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalImg.width;
      tempCanvas.height = originalImg.height;
      tempCanvas.getContext('2d').drawImage(originalImg, 0, 0);
      originalBase64 = tempCanvas.toDataURL('image/jpeg', 0.85);
    }
    
    // 2. TRUE AI BACKGROUND REMOVAL (If enabled)
    callProgress('background_removal', 30);
    
    let subjectImg = originalImg;
    
    if (settings.autoBackgroundRemoval) {
      // Use img.ly WASM AI to isolate subject
      // Public assets path config if needed, defaults are usually fine.
      const blobResult = await removeBackground(imageSource, {
        progress: (key, current, total) => {
          // Model downloading / processing progress mapping to our UI
          const pct = Math.round((current / total) * 100);
          callProgress(`background_removal_model_${key}`, 30 + (pct * 0.4)); // Takes 40% of the bar
        }
      });
      subjectImg = await loadImage(blobResult);
    }

    // 3. SMART CENTERING & PADDING
    callProgress('centering', 75);
    
    // Find absolute bounds of the isolated subject to crop out empty transparent space
    const isolationCanvas = document.createElement('canvas');
    isolationCanvas.width = subjectImg.width;
    isolationCanvas.height = subjectImg.height;
    isolationCanvas.getContext('2d').drawImage(subjectImg, 0, 0);
    
    const bounds = getAlphaBoundingBox(isolationCanvas);
    
    // Set up master output canvas
    const outCanvas = document.createElement('canvas');
    const outCtx = outCanvas.getContext('2d');
    outCanvas.width = settings.canvasWidth;
    outCanvas.height = settings.canvasHeight;
    
    // Fill background
    outCtx.fillStyle = settings.bgColor;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    
    // Calculate scaling to fit within padded canvas area
    const allowedW = outCanvas.width * (1 - settings.padding * 2);
    const allowedH = outCanvas.height * (1 - settings.padding * 2);
    
    const scale = Math.min(allowedW / bounds.objectWidth, allowedH / bounds.objectHeight);
    const renderW = bounds.objectWidth * scale;
    const renderH = bounds.objectHeight * scale;
    
    // Center it absolutely
    const posX = (outCanvas.width - renderW) / 2;
    const posY = (outCanvas.height - renderH) / 2;

    // 4. STUDIO SHADOW FLOOR
    callProgress('studio_lighting', 85);
    
    if (settings.autoBackgroundRemoval && settings.shadowOpacity > 0) {
      // Draw shadow
      outCtx.save();
      outCtx.shadowColor = `rgba(0, 0, 0, ${settings.shadowOpacity})`;
      outCtx.shadowBlur = 40;
      outCtx.shadowOffsetY = 20;
      // Draw subject (which creates the shadow)
      outCtx.drawImage(
        isolationCanvas,
        bounds.minX, bounds.minY, bounds.objectWidth, bounds.objectHeight,
        posX, posY, renderW, renderH
      );
      outCtx.restore();
    }
    
    // 5. RENDER SUBJECT WITHOUT COLOR DISTORTION
    // Draw the image exactly as it is over the shadow (if shadow was drawn, it's drawn again without shadow to be crisp)
    // No ctx.filter is applied! Colors stay 100% true to real life.
    if (settings.autoBackgroundRemoval && settings.shadowOpacity > 0) {
       outCtx.drawImage(
        isolationCanvas,
        bounds.minX, bounds.minY, bounds.objectWidth, bounds.objectHeight,
        posX, posY, renderW, renderH
      );
    } else {
       // Just normal draw
       outCtx.drawImage(
        isolationCanvas,
        bounds.minX, bounds.minY, bounds.objectWidth, bounds.objectHeight,
        posX, posY, renderW, renderH
      );
    }
    
    // 6. OUTPUT COMPRESSION
    callProgress('compression', 95);
    const resultBase64 = outCanvas.toDataURL('image/webp', 0.85);
    
    // Generate mobile thumbnail (Square 600x600)
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d');
    thumbCanvas.width = 600;
    thumbCanvas.height = 600;
    thumbCtx.fillStyle = settings.bgColor;
    thumbCtx.fillRect(0, 0, 600, 600);
    
    const cropSrcX = (outCanvas.width - outCanvas.height) / 2;
    thumbCtx.drawImage(outCanvas, Math.max(0, cropSrcX), 0, Math.min(outCanvas.width, outCanvas.height), outCanvas.height, 0, 0, 600, 600);
    const thumbnailBase64 = thumbCanvas.toDataURL('image/webp', 0.85);

    const executionTimeMs = Date.now() - startTime;
    callProgress('complete', 100);

    return {
      resultBase64,
      thumbnailBase64,
      originalBase64,
      width: outCanvas.width,
      height: outCanvas.height,
      bbox: { minX: posX, minY: posY, maxX: posX + renderW, maxY: posY + renderH },
      originalWidth: originalImg.width,
      originalHeight: originalImg.height,
      executionTimeMs,
      processedSize: Math.round(resultBase64.length * 0.75)
    };

  } catch (err) {
    console.error('Error in Universal AI Engine:', err);
    throw err;
  }
}

