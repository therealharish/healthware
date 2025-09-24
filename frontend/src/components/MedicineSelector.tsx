import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { medicineApi } from '../utils/api';

interface Medicine {
  _id: string;
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface MedicineSelectorProps {
  onSelect: (medicine: Medicine) => void;
  onClose: () => void;
}

export default function MedicineSelector({ onSelect, onClose }: MedicineSelectorProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    // Filter medicines based on search query
    if (searchQuery.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  }, [searchQuery, medicines]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineApi.getMedicines();
      setMedicines(response);
      setFilteredMedicines(response);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[600px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Medicine</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Medicine List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading medicines...</span>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                {searchQuery ? 'No medicines found matching your search' : 'No medicines available'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  onClick={() => handleSelect(medicine)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                    <p className="text-sm text-gray-600">₹{medicine.price} per unit</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      medicine.stock > 10 
                        ? 'bg-green-100 text-green-700'
                        : medicine.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {medicine.stock > 0 ? `${medicine.stock} in stock` : 'Out of stock'}
                    </span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-1" />
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
