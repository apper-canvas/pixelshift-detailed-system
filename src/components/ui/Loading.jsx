import ApperIcon from "@/components/ApperIcon";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-surface rounded-xl border border-gray-700">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ApperIcon name="ImageIcon" size={32} className="text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Processing Images</h3>
        <p className="text-gray-400">Please wait while we convert your images...</p>
        <div className="flex space-x-1 mt-4 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;