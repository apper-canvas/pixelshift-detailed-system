import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const FileUpload = ({ onFilesSelected, accept = "image/*", multiple = true, className }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/25" 
            : "border-gray-600 hover:border-gray-500 hover:bg-surface/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
            isDragOver 
              ? "bg-gradient-to-r from-primary to-secondary shadow-lg" 
              : "bg-gray-700"
          )}>
            <ApperIcon 
              name={isDragOver ? "Upload" : "ImageIcon"} 
              size={32} 
              className="text-white" 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragOver ? "Drop your images here" : "Upload Images"}
            </h3>
            <p className="text-gray-400 mb-4">
              Drag and drop your images or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPEG, PNG, WebP, BMP formats
            </p>
          </div>

          <Button variant="outline" size="lg">
            <ApperIcon name="FolderOpen" size={16} className="mr-2" />
            Browse Files
          </Button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;