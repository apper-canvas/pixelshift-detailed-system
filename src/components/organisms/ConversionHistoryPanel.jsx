import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Empty from '@/components/ui/Empty';
import { conversionHistoryService } from '@/services/api/conversionHistoryService';
import { imageService } from '@/services/api/imageService';
import { formatDistanceToNow } from 'date-fns';

const ConversionHistoryPanel = ({ isOpen, onClose, onApplySettings }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load history items
  useEffect(() => {
    if (isOpen) {
      loadHistoryItems();
    }
  }, [isOpen]);

  // Filter items based on search and format
  useEffect(() => {
    let filtered = historyItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.outputFormat?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (formatFilter) {
      filtered = filtered.filter(item => item.outputFormat === formatFilter);
    }

    setFilteredItems(filtered);
  }, [historyItems, searchTerm, formatFilter]);

  const loadHistoryItems = async () => {
    try {
      setIsLoading(true);
      const items = conversionHistoryService.getAll();
      setHistoryItems(items);
    } catch (error) {
      console.error('Failed to load conversion history:', error);
      toast.error('Failed to load conversion history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySettings = (historyItem) => {
    if (onApplySettings) {
      onApplySettings({
        outputFormat: historyItem.outputFormat,
        quality: historyItem.quality
      });
      toast.success(`Applied settings: ${historyItem.outputFormat.toUpperCase()} at ${historyItem.quality}% quality`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      conversionHistoryService.delete(itemId);
      setHistoryItems(prev => prev.filter(item => item.Id !== itemId));
      toast.success('History item deleted');
    } catch (error) {
      console.error('Failed to delete history item:', error);
      toast.error('Failed to delete history item');
    }
  };

  const handleClearAll = async () => {
    try {
      conversionHistoryService.clear();
      setHistoryItems([]);
      toast.success('Conversion history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatOptions = () => {
    return imageService.getSupportedFormats().map(format => ({
      value: format.value,
      label: format.label
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface/95 backdrop-blur-sm border-l border-gray-700 z-50 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <ApperIcon name="History" size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Conversion History</h2>
                    <p className="text-xs text-gray-400">{historyItems.length} conversions</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-700 space-y-4">
                <Input
                  placeholder="Search conversions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  leftIcon="Search"
                />
                
                <div className="flex items-center space-x-3">
                  <Select
                    value={formatFilter}
                    onValueChange={setFormatFilter}
                    placeholder="All formats"
                    className="flex-1"
                  >
                    <option value="">All formats</option>
                    {getFormatOptions().map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </Select>
                  
                  {historyItems.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-red-400 hover:text-red-300"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              </div>

              {/* History Items */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <Empty
                    icon="History"
                    title={historyItems.length === 0 ? "No conversion history" : "No matching conversions"}
                    description={historyItems.length === 0 ? "Your conversion history will appear here after you convert some images." : "Try adjusting your search or filter criteria."}
                    className="h-full"
                  />
                ) : (
                  <div className="p-6 space-y-4">
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.Id}
                        className="bg-background/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <ApperIcon name="FileImage" size={16} className="text-gray-400 flex-shrink-0" />
                              <h3 className="text-sm font-medium text-white truncate">
                                {item.originalName || 'Unknown file'}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.Id)}
                            className="text-gray-400 hover:text-red-400 flex-shrink-0 ml-2"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.outputFormat?.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.quality}%
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">
                            {item.originalSize ? formatFileSize(item.originalSize) : 'Unknown size'}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleApplySettings(item)}
                          className="w-full text-sm bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                          size="sm"
                        >
                          <ApperIcon name="RotateCcw" size={14} className="mr-2" />
                          Apply These Settings
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConversionHistoryPanel;