import { Calendar, Clock, Shield, Smartphone, Users, Zap, FileText, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
  isLoggedIn?: boolean;
}

export default function HomePage({ onNavigate, isLoggedIn = false }: HomePageProps) {
  const { user } = useAuth();
  const patientFeatures = [
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

  const doctorFeatures = [
    {
      icon: Calendar,
      title: 'Appointment Management',
      description: 'View and manage your daily appointments with ease. Access patient information and notes before consultations.',
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Create digital prescriptions with our comprehensive medicine database. Reduce errors and improve patient safety.',
    },
    {
      icon: Shield,
      title: 'Secure Patient Records',
      description: 'Access complete patient medical history securely. Make informed decisions with comprehensive health data.',
    },
    {
      icon: Activity,
      title: 'Treatment Tracking',
      description: 'Monitor patient progress and treatment outcomes. Keep detailed records of consultations and procedures.',
    },
    {
      icon: Users,
      title: 'Patient Communication',
      description: 'Streamlined communication with patients. Send updates, reminders, and follow-up instructions digitally.',
    },
    {
      icon: BarChart3,
      title: 'Practice Analytics',
      description: 'Track your practice performance with detailed analytics. Monitor patient satisfaction and treatment outcomes.',
    },
  ];

  const features = user?.userType === 'doctor' ? doctorFeatures : patientFeatures;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {user?.userType === 'doctor' ? (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Practice Management Made
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Simple</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Streamline your practice with digital tools designed for modern healthcare. 
                  Manage appointments, create prescriptions, and track patient care efficiently.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => onNavigate('doctor-dashboard')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Healthcare Made
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Simple</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Skip the queues, reduce the stress, and focus on what matters most - your health. 
                  CareConnect streamlines your entire healthcare journey from booking to treatment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {user && (
                    <button
                      onClick={() => onNavigate('book-appointment')}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Book Your Appointment
                    </button>
                  )}
                  {!isLoggedIn && (
                    <>
                      <button
                        onClick={() => onNavigate('login')}
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => onNavigate('about')}
                        className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
                      >
                        Learn More
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {user?.userType === 'doctor' ? 'Why Doctors Choose CareConnect?' : 'Why Choose CareConnect?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {user?.userType === 'doctor' 
                ? "We've built a comprehensive platform to streamline your practice and enhance patient care."
                : "We've reimagined healthcare to be more accessible, efficient, and stress-free for everyone."
              }
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
          {user?.userType === 'doctor' ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Enhance Your Practice?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join healthcare professionals who are already providing better patient care with CareConnect.
              </p>
              <button
                onClick={() => onNavigate('doctor-dashboard')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of patients who have already simplified their healthcare journey with CareConnect.
              </p>
              {user ? (
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Book Your Appointment
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Get Started Today
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}