const STORAGE_KEY = 'pixelshift_conversion_history';

// Mock data for initial state
const mockConversionHistory = [];

let historyData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...mockConversionHistory];

// Ensure all items have proper ID structure
historyData = historyData.map((item, index) => ({
  ...item,
  Id: item.Id || index + 1
}));

let nextId = Math.max(0, ...historyData.map(item => item.Id || 0)) + 1;

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
};

export const conversionHistoryService = {
  getAll: () => {
    return [...historyData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  getById: (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    const item = historyData.find(item => item.Id === id);
    return item ? { ...item } : null;
  },

  create: (conversionData) => {
    const newConversion = {
      ...conversionData,
      Id: nextId++,
      timestamp: new Date().toISOString()
    };
    
    historyData.push(newConversion);
    saveToStorage();
    return { ...newConversion };
  },

  update: (id, data) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const index = historyData.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Conversion history item not found');
    }
    
    historyData[index] = {
      ...historyData[index],
      ...data,
      Id: id,
      timestamp: historyData[index].timestamp // Preserve original timestamp
    };
    
    saveToStorage();
    return { ...historyData[index] };
  },

  delete: (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const index = historyData.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Conversion history item not found');
    }
    
    historyData.splice(index, 1);
    saveToStorage();
    return true;
  },

  clear: () => {
    historyData.length = 0;
    nextId = 1;
    saveToStorage();
    return true;
  },

  getByFilters: (filters = {}) => {
    let filtered = [...historyData];
    
    if (filters.format) {
      filtered = filtered.filter(item => 
        item.outputFormat === filters.format
      );
    }
    
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= start && itemDate <= end;
      });
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.originalName?.toLowerCase().includes(searchTerm) ||
        item.outputFormat?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};

export default conversionHistoryService;