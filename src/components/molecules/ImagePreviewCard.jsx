import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/helpers";

const ImagePreviewCard = ({ 
  imageFile, 
  onRemove, 
  onDownload, 
  className 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getSizeChange = () => {
    if (!imageFile.convertedSize || !imageFile.originalSize) return null;
    const change = ((imageFile.convertedSize - imageFile.originalSize) / imageFile.originalSize) * 100;
    return Math.round(change);
  };

  const getSizeChangeColor = (change) => {
    if (change < 0) return "success"; // Size reduced
    if (change > 50) return "warning"; // Significant increase
    return "info"; // Moderate change
  };

  const sizeChange = getSizeChange();

  return (
    <motion.div
      className={cn(
        "bg-surface rounded-xl border border-gray-600/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Image Preview */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {!imageError ? (
          <img
            src={imageFile.preview}
            alt={imageFile.originalFile.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ApperIcon name="ImageIcon" size={48} className="text-gray-500" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {imageFile.status === "converting" && (
            <Badge variant="info">
              <ApperIcon name="Loader2" size={12} className="mr-1 animate-spin" />
              Converting
            </Badge>
          )}
          {imageFile.status === "converted" && (
            <Badge variant="success">
              <ApperIcon name="CheckCircle" size={12} className="mr-1" />
              Ready
            </Badge>
          )}
          {imageFile.status === "error" && (
            <Badge variant="error">
              <ApperIcon name="AlertCircle" size={12} className="mr-1" />
              Error
            </Badge>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-3 left-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ApperIcon name="X" size={16} className="text-white" />
        </button>
      </div>

      {/* File Info */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-white truncate" title={imageFile.originalFile.name}>
            {imageFile.originalFile.name}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
            <span className="uppercase font-medium">
              {imageFile.originalFormat}
            </span>
            <ApperIcon name="ArrowRight" size={14} />
            <span className="uppercase font-medium text-primary">
              {imageFile.convertedFormat}
            </span>
          </div>
        </div>

        {/* Size Information */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Original:</span>
            <span className="text-white">{formatFileSize(imageFile.originalSize)}</span>
          </div>
          {imageFile.convertedSize && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Converted:</span>
                <span className="text-white">{formatFileSize(imageFile.convertedSize)}</span>
              </div>
              {sizeChange !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size Change:</span>
                  <Badge variant={getSizeChangeColor(sizeChange)} className="text-xs">
                    {sizeChange > 0 ? "+" : ""}{sizeChange}%
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Download Button */}
        {imageFile.status === "converted" && imageFile.convertedBlob && (
          <Button 
            onClick={onDownload}
            size="sm"
            className="w-full"
          >
            <ApperIcon name="Download" size={16} className="mr-2" />
            Download
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ImagePreviewCard;