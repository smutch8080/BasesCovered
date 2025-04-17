import { Link } from 'react-router-dom';

export default function EliteClinicsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[700px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/f71156e251258bde2684c1b5a65395b7-xxlarge.jpeg"
          alt="Elite Softball Clinics"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Elite Softball Clinics
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
              Advanced training programs designed to elevate your game. Learn from top coaches and experience collegiate-level instruction.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/elite-clinics/register"
                className="px-8 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg"
              >
                Register Now
              </Link>
              <Link
                to="/elite-clinics/schedule"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 