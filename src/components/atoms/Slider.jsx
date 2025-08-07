import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Slider = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="range"
      ref={ref}
      className={cn(
        "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full slider-thumb:bg-gradient-to-r slider-thumb:from-primary slider-thumb:to-secondary slider-thumb:cursor-pointer slider-thumb:border-0 focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      style={{
        background: `linear-gradient(to right, #6366F1 0%, #8B5CF6 ${((props.value - props.min) / (props.max - props.min)) * 100}%, #374151 ${((props.value - props.min) / (props.max - props.min)) * 100}%, #374151 100%)`
      }}
      {...props}
    />
  );
});

Slider.displayName = "Slider";

export default Slider;