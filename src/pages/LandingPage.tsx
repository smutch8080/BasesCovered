import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, BookOpen, Shield, Star, ChevronRight, FolderOpen, Target, Music, MapPin } from 'lucide-react';
import { getFeaturedChant } from '../services/chants';
import { Chant } from '../types/chants';
import { FeaturedChant } from '../components/chants/FeaturedChant';
import { Footer } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';

const features = [
  {
    icon: <Trophy className="w-8 h-8 text-brand-primary" />,
    title: "Practice Planning Made Easy",
    description: "Create, customize, and share practice plans with our intuitive drag-and-drop interface."
  },
  {
    icon: <Users className="w-8 h-8 text-brand-primary" />,
    title: "Team Management",
    description: "Manage players, coaches, and parents all in one place. Track attendance and progress effortlessly."
  },
  {
    icon: <Calendar className="w-8 h-8 text-brand-primary" />,
    title: "Event Scheduling",
    description: "Schedule practices, games, and team events. Send automatic reminders and track RSVPs."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-brand-primary" />,
    title: "Player Development",
    description: "Track player progress, assign homework, and create personalized development plans."
  }
];

const testimonials = [
  {
    quote: "This platform has transformed how I manage my team. The practice planning tools are incredible!",
    author: "Sarah Johnson",
    role: "Head Coach, Thunder Strikers 12U"
  },
  {
    quote: "As a parent, I love being able to track my daughter's progress and stay connected with the team.",
    author: "Michael Chen",
    role: "Team Parent"
  },
  {
    quote: "The drill library and practice plans have helped me become a better coach.",
    author: "David Martinez",
    role: "Assistant Coach, Lightning 14U"
  }
];

const resources = [
  {
    icon: <FolderOpen className="w-12 h-12 text-brand-primary" />,
    title: "Community Resources",
    description: "Access shared coaching materials, training guides, and best practices from our community.",
    link: "/resources"
  },
  {
    icon: <Target className="w-12 h-12 text-brand-primary" />,
    title: "Drill Library",
    description: "Browse our collection of softball drills for all skill levels and positions.",
    link: "/drills"
  },
  {
    icon: <Music className="w-12 h-12 text-brand-primary" />,
    title: "Team Chants",
    description: "Discover and share team chants to boost team spirit and energy.",
    link: "/chants"
  },
  {
    icon: <MapPin className="w-12 h-12 text-brand-primary" />,
    title: "Field Visualizer",
    description: "Create and share field diagrams, demonstrate plays, and teach game strategies.",
    link: "/field-visualizer",
    isNew: true
  }
];

export default function LandingPage() {
  const [featuredChant, setFeaturedChant] = useState<Chant | null>(null);

  useEffect(() => {
    const loadFeaturedChant = async () => {
      const chant = await getFeaturedChant();
      setFeaturedChant(chant);
    };

    loadFeaturedChant();
  }, []);

  return (
    <PageLayout className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1528291954423-c0c71c12baeb" 
          alt="Softball player sliding into base"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#f1efe7]">
              Transform Your Softball Experience
            </h1>
            <h2 className="text-xl md:text-2xl mb-8 text-[#f1efe7]">
              Tech | Training | Gear
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              The all-in-one platform for practice planning, team management, and player development built for coaches, players, and parents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Get Started Free
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/coaches"
                  className="px-8 py-3 bg-[#37543c] text-[#f1efe7] rounded-lg font-semibold hover:opacity-90 transition-colors"
                >
                  Find a Coach
                </Link>
                <Link
                  to="/clinics"
                  className="px-8 py-3 bg-[#37543c] text-[#f1efe7] rounded-lg font-semibold hover:opacity-90 transition-colors"
                >
                  Find a Clinic
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features That Make a Difference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Community Resources for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource, index) => (
              <Link key={index} to={resource.link} className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm h-full hover:shadow-md transition-shadow">
                  <div className="mb-4">{resource.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {resource.title}
                    {resource.isNew && (
                      <span className="text-xs bg-brand-primary text-white px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">{resource.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chant Section */}
      {featuredChant && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Team Cheer!</h2>
            <FeaturedChant chant={featuredChant} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#37543c]">Ready to Transform Your Coaching?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join coaches who are already using BasesCovered to elevate their teams.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Get Started Free
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </PageLayout>
  );
}