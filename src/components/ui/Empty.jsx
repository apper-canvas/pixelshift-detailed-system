import { forwardRef } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const Empty = forwardRef(({ 
  className, 
  title = "No Images to Convert",
  description = "Drop some images here or click to upload and start converting between formats",
  onAction,
  actionLabel = "Upload Images",
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] bg-surface rounded-xl border border-gray-600/30 p-8",
        className
      )}
      {...props}
    >
      <div className="w-20 h-20 mb-6 bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center opacity-80">
        <ApperIcon name="ImageIcon" size={40} className="text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-center mb-8 max-w-lg">{description}</p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 shadow-lg shadow-primary/25"
        >
          <ApperIcon name="Upload" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

Empty.displayName = "Empty";

export default Empty;