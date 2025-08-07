import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormatSelector = ({ value, onChange, className }) => {
  const formats = [
    { value: "jpeg", label: "JPEG", description: "Good compression, smaller files" },
    { value: "png", label: "PNG", description: "Lossless, supports transparency" },
    { value: "webp", label: "WebP", description: "Modern format, best compression" },
    { value: "bmp", label: "BMP", description: "Uncompressed, large files" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor="format-select">Output Format</Label>
      <Select 
        id="format-select"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {formats.map((format) => (
          <option key={format.value} value={format.value}>
            {format.label} - {format.description}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default FormatSelector;