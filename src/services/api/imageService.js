import React from "react";
import Error from "@/components/ui/Error";
export const imageService = {
  convertImage: async (file, outputFormat, quality = 85) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to desired format
        const mimeType = `image/${outputFormat === "jpg" ? "jpeg" : outputFormat}`;
        const qualityValue = (outputFormat === "jpeg" || outputFormat === "webp") ? quality / 100 : 1;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image"));
            }
          },
          mimeType,
          qualityValue
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  },

  getSupportedFormats: () => {
    return [
      { value: "jpeg", label: "JPEG", mimeType: "image/jpeg" },
      { value: "png", label: "PNG", mimeType: "image/png" },
      { value: "webp", label: "WebP", mimeType: "image/webp" },
      { value: "bmp", label: "BMP", mimeType: "image/bmp" },
    ];
  },

  validateImageFile: (file) => {
    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!supportedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    return true;
  },

  getImageDimensions: (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error("Failed to get image dimensions"));
        URL.revokeObjectURL(img.src);
      };
img.src = URL.createObjectURL(file);
    });
  },

  // Track conversion for history
  trackConversion: (originalFile, convertedBlob, outputFormat, quality) => {
    return {
      originalName: originalFile.name,
      originalSize: originalFile.size,
      convertedSize: convertedBlob.size,
      outputFormat: outputFormat,
      quality: quality,
      timestamp: new Date().toISOString()
    };
  }
};