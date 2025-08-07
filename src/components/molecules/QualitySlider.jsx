import Label from "@/components/atoms/Label";
import Slider from "@/components/atoms/Slider";
import { cn } from "@/utils/cn";

const QualitySlider = ({ value, onChange, format, className }) => {
  const showQuality = format === "jpeg" || format === "webp";

  if (!showQuality) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="quality-slider">Quality</Label>
        <span className="text-sm font-medium text-gray-300 bg-gray-700 px-2 py-1 rounded">
          {value}%
        </span>
      </div>
      <Slider
        id="quality-slider"
        min={10}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Lower size</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
};

export default QualitySlider;