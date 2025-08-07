import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { imageService } from "@/services/api/imageService";
import { paymentService } from "@/services/api/paymentService";
import ApperIcon from "@/components/ApperIcon";
import FileUpload from "@/components/molecules/FileUpload";
import FormatSelector from "@/components/molecules/FormatSelector";
import ImagePreviewCard from "@/components/molecules/ImagePreviewCard";
import QualitySlider from "@/components/molecules/QualitySlider";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import { generateId } from "@/utils/helpers";

const ImageConverter = () => {
const [images, setImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaymentAccess, setHasPaymentAccess] = useState(false);
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

      // Save to conversion history
      try {
        const { conversionHistoryService } = await import('@/services/api/conversionHistoryService');
        conversionHistoryService.create({
          originalName: imageFile.name,
          originalSize: imageFile.size,
          outputFormat: outputFormat,
          quality: quality,
          convertedSize: convertedBlob.size
        });
      } catch (error) {
        console.error('Failed to save conversion history:', error);
      }

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

const handlePaymentAndConvert = async () => {
    if (images.length === 0) return;

    // Check if user already has payment access
    if (hasPaymentAccess || paymentService.checkPaymentStatus()) {
      await performConversion();
      return;
    }

    // Start payment process
    setIsProcessingPayment(true);

    try {
      // Create checkout session
      const sessionResult = await paymentService.createCheckoutSession(images.length);
      
      if (!sessionResult.success) {
        toast.error("Failed to create payment session. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      const amount = paymentService.formatPrice(sessionResult.amount);
      toast.info(`Processing payment of $${amount} for ${images.length} image${images.length > 1 ? 's' : ''}...`);

      // Redirect to checkout
      const paymentResult = await paymentService.redirectToCheckout(sessionResult.sessionId);

      if (paymentResult.success) {
        setHasPaymentAccess(true);
        toast.success("Payment successful! Converting images now...");
        await performConversion();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const performConversion = async () => {
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

  // Legacy method name for backward compatibility
  const handleConvertAll = handlePaymentAndConvert;

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

  const handleApplyHistorySettings = (settings) => {
    setOutputFormat(settings.outputFormat);
    setQuality(settings.quality);
    setIsHistoryPanelOpen(false);
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

  // Import ConversionHistoryPanel dynamically
  const [ConversionHistoryPanel, setConversionHistoryPanel] = useState(null);
  
  useEffect(() => {
    import('./ConversionHistoryPanel').then(module => {
      setConversionHistoryPanel(() => module.default);
    });
  }, []);

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
              onClick={handlePaymentAndConvert}
              disabled={images.length === 0 || isConverting || isProcessingPayment}
              className="w-full"
              size="lg"
            >
              {isProcessingPayment ? (
                <>
                  <ApperIcon name="CreditCard" size={16} className="mr-2 animate-pulse" />
                  Processing Payment...
                </>
              ) : isConverting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Converting...
                </>
              ) : hasPaymentAccess || paymentService.checkPaymentStatus() ? (
                <>
                  <ApperIcon name="Zap" size={16} className="mr-2" />
                  Convert All Images
                </>
              ) : (
                <>
                  <ApperIcon name="CreditCard" size={16} className="mr-2" />
                  Pay & Convert (${paymentService.formatPrice(paymentService.calculateAmount(images.length))})
                </>
              )}
            </Button>

            {!hasPaymentAccess && !paymentService.checkPaymentStatus() && images.length > 0 && (
              <div className="text-center text-sm text-gray-400 mt-2">
                <ApperIcon name="Info" size={14} className="inline mr-1" />
                ${paymentService.formatPrice(100)} per image • Secure payment via Stripe
              </div>
            )}
            
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

      {/* History Panel Toggle */}
      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={() => setIsHistoryPanelOpen(true)}
          variant="ghost"
          className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600"
        >
          <ApperIcon name="History" size={16} className="mr-2" />
          View Conversion History
        </Button>
      </motion.div>

      {/* Conversion History Panel */}
      {ConversionHistoryPanel && (
        <ConversionHistoryPanel
          isOpen={isHistoryPanelOpen}
          onClose={() => setIsHistoryPanelOpen(false)}
          onApplySettings={handleApplyHistorySettings}
        />
      )}
    </div>
  );
};

export default ImageConverter;