interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export async function compressImage(
  dataUrl: string, 
  options: CompressOptions = { maxWidth: 800, maxHeight: 800, quality: 0.8 }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > options.maxWidth) {
        height *= options.maxWidth / width;
        width = options.maxWidth;
      }
      if (height > options.maxHeight) {
        width *= options.maxHeight / height;
        height = options.maxHeight;
      }

      // Create canvas and context
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', options.quality);

      // Verify size is under 500KB
      const base64Size = compressedDataUrl.length * (3/4) - 2;
      if (base64Size > 500 * 1024) {
        // If still too large, try again with more aggressive compression
        return compressImage(dataUrl, {
          ...options,
          maxWidth: Math.floor(width * 0.8),
          maxHeight: Math.floor(height * 0.8),
          quality: Math.max(0.5, options.quality - 0.1)
        }).then(resolve);
      }

      resolve(compressedDataUrl);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}