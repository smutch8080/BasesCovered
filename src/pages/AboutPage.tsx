import React from 'react';
import { Trophy, Users, Award, Heart } from 'lucide-react';

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Trophy className="w-16 h-16 text-brand-primary mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          About Coach Pad
        </h1>
        <p className="text-xl text-gray-600">
          Empowering softball coaches and players with the tools they need to succeed.
        </p>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            At Coach Pad, we're dedicated to revolutionizing softball coaching through innovative technology 
            and comprehensive tools. Our platform empowers coaches to create effective practice plans, 
            track player development, and build stronger teams.
          </p>
          <p className="text-gray-600">
            We believe that every player deserves the opportunity to reach their full potential, 
            and every coach should have access to the resources they need to make that happen.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="w-10 h-10 text-brand-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
            <p className="text-gray-600">
              Building strong connections between coaches, players, and parents to create 
              a supportive softball community.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Award className="w-10 h-10 text-brand-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Excellence</h3>
            <p className="text-gray-600">
              Striving for excellence in everything we do, from our platform features 
              to our customer support.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="w-10 h-10 text-brand-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Passion</h3>
            <p className="text-gray-600">
              Sharing our passion for softball and helping others develop their love 
              for the game.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Team</h2>
          <p className="text-gray-600 mb-4">
            Coach Pad was founded by a team of softball coaches, players, and technology experts 
            who understand the unique challenges faced by softball programs. Our diverse team brings 
            together decades of experience in softball coaching, player development, and software engineering.
          </p>
          <p className="text-gray-600">
            We're committed to continuously improving our platform based on feedback from our 
            community of coaches and players. Together, we're building the future of softball coaching.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;