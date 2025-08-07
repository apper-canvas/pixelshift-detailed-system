import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FileUpload from "@/components/molecules/FileUpload";
import FormatSelector from "@/components/molecules/FormatSelector";
import QualitySlider from "@/components/molecules/QualitySlider";
import ImagePreviewCard from "@/components/molecules/ImagePreviewCard";
import Empty from "@/components/ui/Empty";
import { imageService } from "@/services/api/imageService";
import { generateId } from "@/utils/helpers";

const ImageConverter = () => {
  const [images, setImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = async (files) => {
    const newImages = files.map(file => ({
      id: generateId(),
      originalFile: file,
      originalFormat: file.type.replace("image/", ""),
      originalSize: file.size,
      preview: URL.createObjectURL(file),
      convertedBlob: null,
      convertedFormat: outputFormat,
      convertedSize: null,
      quality: quality,
      status: "pending"
    }));

    setImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image${files.length > 1 ? "s" : ""} for conversion`);
  };

  const convertImage = async (imageFile) => {
    try {
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: "converting" }
          : img
      ));

      const convertedBlob = await imageService.convertImage(
        imageFile.originalFile, 
        outputFormat, 
        quality
      );

      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { 
              ...img, 
              convertedBlob,
              convertedSize: convertedBlob.size,
              convertedFormat: outputFormat,
              status: "converted"
            }
          : img
      ));

      return true;
    } catch (error) {
      console.error("Conversion error:", error);
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: "error" }
          : img
      ));
      return false;
    }
  };

  const handleConvertAll = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    const pendingImages = images.filter(img => 
      img.status === "pending" || 
      img.convertedFormat !== outputFormat ||
      img.quality !== quality
    );

    if (pendingImages.length === 0) {
      toast.info("All images are already converted with current settings");
      setIsConverting(false);
      return;
    }

    let successCount = 0;
    
    for (const image of pendingImages) {
      const success = await convertImage({
        ...image,
        convertedFormat: outputFormat,
        quality: quality
      });
      if (success) successCount++;
    }

    setIsConverting(false);
    
    if (successCount > 0) {
      toast.success(`Successfully converted ${successCount} image${successCount > 1 ? "s" : ""}`);
    }
    if (successCount < pendingImages.length) {
      toast.error(`Failed to convert ${pendingImages.length - successCount} image${pendingImages.length - successCount > 1 ? "s" : ""}`);
    }
  };

  const handleDownload = (imageFile) => {
    if (!imageFile.convertedBlob) return;

    const url = URL.createObjectURL(imageFile.convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${imageFile.originalFile.name.split(".")[0]}.${imageFile.convertedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Image downloaded successfully!");
  };

  const handleDownloadAll = () => {
    const convertedImages = images.filter(img => img.status === "converted" && img.convertedBlob);
    
    if (convertedImages.length === 0) {
      toast.warning("No converted images to download");
      return;
    }

    convertedImages.forEach(image => {
      setTimeout(() => handleDownload(image), 100);
    });
    
    toast.success(`Downloaded ${convertedImages.length} images`);
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
    toast.info("Image removed");
  };

  const handleClearAll = () => {
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
    toast.info("All images cleared");
  };

  // Update converted format and quality for existing images when settings change
  useEffect(() => {
    setImages(prev => prev.map(img => ({
      ...img,
      convertedFormat: outputFormat,
      quality: quality,
      status: img.status === "converted" && 
               (img.convertedFormat !== outputFormat || img.quality !== quality) 
               ? "pending" 
               : img.status
    })));
  }, [outputFormat, quality]);

  const convertedCount = images.filter(img => img.status === "converted").length;
  const hasConvertedImages = convertedCount > 0;

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FileUpload onFilesSelected={handleFilesSelected} />
        </div>
        
        <div className="space-y-6">
          <FormatSelector 
            value={outputFormat} 
            onChange={setOutputFormat}
          />
          
          <QualitySlider 
            value={quality}
            onChange={setQuality}
            format={outputFormat}
          />
          
          <div className="space-y-3">
            <Button 
              onClick={handleConvertAll}
              disabled={images.length === 0 || isConverting}
              className="w-full"
              size="lg"
            >
              {isConverting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ApperIcon name="Zap" size={16} className="mr-2" />
                  Convert All Images
                </>
              )}
            </Button>
            
            {hasConvertedImages && (
              <Button 
                onClick={handleDownloadAll}
                variant="secondary"
                className="w-full"
              >
                <ApperIcon name="Download" size={16} className="mr-2" />
                Download All ({convertedCount})
              </Button>
            )}
            
            {images.length > 0 && (
              <Button 
                onClick={handleClearAll}
                variant="ghost"
                className="w-full text-gray-400 hover:text-error"
              >
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Empty 
          title="Ready to Convert Images"
          description="Upload images above to start converting between different formats. Supports batch conversion with real-time preview."
          onAction={() => document.querySelector('input[type="file"]')?.click()}
          actionLabel="Choose Files"
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Images ({images.length})
            </h2>
            <div className="text-sm text-gray-400">
              {convertedCount} of {images.length} converted
            </div>
          </div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence>
              {images.map((image) => (
                <ImagePreviewCard
                  key={image.id}
                  imageFile={image}
                  onRemove={() => handleRemoveImage(image.id)}
                  onDownload={() => handleDownload(image)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;