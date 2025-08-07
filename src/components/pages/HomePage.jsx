import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import ImageConverter from "@/components/organisms/ImageConverter";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="ImageIcon" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PixelShift
                </h1>
                <p className="text-xs text-gray-400">Client-side Image Converter</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <ApperIcon name="Shield" size={16} />
                <span>100% Private</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <ApperIcon name="Zap" size={16} />
                <span>No Upload Required</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Convert Images
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Instantly</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Transform your images between JPEG, PNG, WebP, and BMP formats entirely in your browser. 
            No uploads, no servers, complete privacy.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: "Lock", text: "100% Private" },
              { icon: "Zap", text: "Instant Conversion" },
              { icon: "Download", text: "Batch Download" },
              { icon: "Sliders", text: "Quality Control" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center space-x-2 bg-surface/80 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <ApperIcon name={feature.icon} size={14} className="text-primary" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Image Converter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <ImageConverter />
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {[
            {
              icon: "Shield",
              title: "Complete Privacy",
              description: "All processing happens in your browser. Your images never leave your device.",
              gradient: "from-success to-emerald-600"
            },
            {
              icon: "Gauge",
              title: "Lightning Fast",
              description: "Convert images instantly without waiting for server processing or uploads.",
              gradient: "from-primary to-secondary"
            },
            {
              icon: "Layers",
              title: "Batch Processing",
              description: "Convert multiple images at once and download them all with a single click.",
              gradient: "from-accent to-pink-600"
            }
          ].map((info, index) => (
            <div key={info.title} className="bg-surface/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-r ${info.gradient} rounded-lg flex items-center justify-center mb-4`}>
                <ApperIcon name={info.icon} size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
              <p className="text-gray-400">{info.description}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 PixelShift. Built with privacy and speed in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;