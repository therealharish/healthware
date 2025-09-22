import React from 'react';
import { Calendar, Clock, Shield, Smartphone, Users, Zap } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Book appointments with your preferred doctors in just a few clicks. View real-time availability and choose slots that work for you.',
    },
    {
      icon: Clock,
      title: 'No More Waiting',
      description: 'Skip the reception desk and billing queues. Simply show up at your scheduled time for a stress-free hospital visit.',
    },
    {
      icon: Shield,
      title: 'Secure Medical Records',
      description: 'Your medical history is safely stored and accessible to your doctors before consultations for better care.',
    },
    {
      icon: Smartphone,
      title: 'Digital Prescriptions',
      description: 'Receive digital prescriptions and order medicines online. No more paper prescriptions to lose or forget.',
    },
    {
      icon: Users,
      title: 'Family Care Management',
      description: 'Manage appointments and health records for your entire family, including elderly relatives who need support.',
    },
    {
      icon: Zap,
      title: 'Instant Test Booking',
      description: 'Book diagnostic tests, pay online, and receive instant confirmation. Get results delivered digitally.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Healthcare Made
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Skip the queues, reduce the stress, and focus on what matters most - your health. 
              CareConnect streamlines your entire healthcare journey from booking to treatment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('book-appointment')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Book Your Appointment
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CareConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've reimagined healthcare to be more accessible, efficient, and stress-free for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who have already simplified their healthcare journey with CareConnect.
          </p>
          <button
            onClick={() => onNavigate('book-appointment')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}