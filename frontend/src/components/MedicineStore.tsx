import React, { useState } from 'react';
import { Pill, ShoppingCart, Search, Filter, Package } from 'lucide-react';

interface MedicineStoreProps {
  onNavigate: (page: string) => void;
}

export default function MedicineStore({ onNavigate }: MedicineStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const prescribedMedicines = [
    {
      id: '1',
      name: 'Lisinopril 10mg',
      genericName: 'Lisinopril',
      price: 12.99,
      description: 'ACE inhibitor for high blood pressure',
      inStock: true,
      prescribed: true,
      doctor: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      name: 'Metformin 500mg',
      genericName: 'Metformin HCl',
      price: 8.50,
      description: 'Diabetes medication',
      inStock: true,
      prescribed: true,
      doctor: 'Dr. Sarah Johnson'
    }
  ];

  const otcMedicines = [
    {
      id: '3',
      name: 'Ibuprofen 200mg',
      genericName: 'Ibuprofen',
      price: 6.99,
      description: 'Pain reliever and anti-inflammatory',
      inStock: true,
      prescribed: false
    },
    {
      id: '4',
      name: 'Acetaminophen 500mg',
      genericName: 'Acetaminophen',
      price: 5.99,
      description: 'Pain reliever and fever reducer',
      inStock: true,
      prescribed: false
    },
    {
      id: '5',
      name: 'Vitamin D3 1000 IU',
      genericName: 'Cholecalciferol',
      price: 11.99,
      description: 'Vitamin D supplement',
      inStock: true,
      prescribed: false
    }
  ];

  const addToCart = (medicineId: string) => {
    setCart(prev => ({
      ...prev,
      [medicineId]: (prev[medicineId] || 0) + 1
    }));
  };

  const getCartTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([id, quantity]) => {
      const medicine = [...prescribedMedicines, ...otcMedicines].find(m => m.id === id);
      if (medicine) {
        total += medicine.price * quantity;
      }
    });
    return total.toFixed(2);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Store</h1>
          <p className="text-lg text-gray-600">Order your prescribed medicines and health essentials</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Search for medicines..."
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            {getCartItemCount() > 0 && (
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({getCartItemCount()})</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">${getCartTotal()}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Prescribed Medicines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Prescribed Medicines</h2>
                  <p className="text-gray-600">Prescribed by your doctors</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {prescribedMedicines.map((medicine) => (
                  <div key={medicine.id} className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                        <p className="text-green-600 text-sm font-medium">Prescribed by {medicine.doctor}</p>
                        <p className="text-gray-600 text-sm">{medicine.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${medicine.price}</p>
                        <p className="text-green-600 text-sm">In Stock</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(medicine.id)}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Over-the-Counter Medicines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Over-the-Counter</h2>
                  <p className="text-gray-600">Available without prescription</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {otcMedicines.map((medicine) => (
                  <div key={medicine.id} className="p-6 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{medicine.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-gray-900">${medicine.price}</p>
                        <p className="text-green-600 text-sm">In Stock</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(medicine.id)}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart Summary */}
            {getCartItemCount() > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>
                <div className="space-y-3 mb-4">
                  {Object.entries(cart).map(([id, quantity]) => {
                    const medicine = [...prescribedMedicines, ...otcMedicines].find(m => m.id === id);
                    return medicine ? (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{medicine.name} x{quantity}</span>
                        <span className="font-medium">${(medicine.price * quantity).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="border-t pt-3 mb-4">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">${getCartTotal()}</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Delivery Information</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Free delivery on orders over $25</p>
                <p>• Same-day delivery available</p>
                <p>• Prescription verification required</p>
                <p>• Secure packaging guaranteed</p>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Need Help?</h3>
              <p className="text-sm text-green-800 mb-4">
                Our pharmacy team is available to answer questions about your medications.
              </p>
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                Chat with Pharmacist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}