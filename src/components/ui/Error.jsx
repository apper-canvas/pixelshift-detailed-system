import { forwardRef } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const Error = forwardRef(({ className, message = "Something went wrong", onRetry, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] bg-surface rounded-xl border border-red-500/20 p-8",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 mb-6 bg-gradient-to-r from-error to-red-600 rounded-full flex items-center justify-center">
        <ApperIcon name="AlertCircle" size={32} className="text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">Conversion Error</h3>
      <p className="text-gray-400 text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
});

Error.displayName = "Error";

export default Error;