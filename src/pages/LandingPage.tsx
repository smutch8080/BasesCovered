import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Crown, Zap, BookOpen, Shield, Star, ChevronRight, FolderOpen, Target, Music, MapPin, Check, Sun } from 'lucide-react';
import { getFeaturedChant } from '../services/chants';
import { Chant } from '../types/chants';
import { FeaturedChant } from '../components/chants/FeaturedChant';
import { Footer } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';

const pods = [
  {
    id: 'power-hitter',
    title: 'Power Hitter Pod',
    icon: <Zap className="w-8 h-8" />,
    tagline: 'Batting Fundamentals & Advanced Hitting Techniques',
    description: 'Master the art of hitting with focused training on mechanics, power generation, and mental approach.',
    learns: [
      'Proper Bat Grip & Swing Mechanics',
      'Contact Point & Timing Drills',
      'Power Generation & Plate Discipline',
      'Mental Approach for Pressure Situations'
    ],
    uniqueness: 'We merge foundational swing principles with individualized video analysis, ensuring each hitter maximizes bat speed and consistency. Expect specialized batting drills, real-time feedback, and a progressive plan that elevates contact to consistent power hitting.'
  },
  {
    id: 'golden-glove',
    title: 'Golden Glove Pod',
    icon: <Shield className="w-8 h-8" />,
    tagline: 'Fielding Essentials & Advanced Defensive Tactics',
    description: 'Premium defense training—catch everything and make the impossible look routine.',
    learns: [
      'Ready Position & Footwork Mastery',
      'Quick Transfers & Accurate Throwing',
      'Reading the Ball Off the Bat',
      'Infield/Outfield Position-Specific Techniques'
    ],
    uniqueness: 'Our Golden Glove approach trains mental sharpness alongside physical skill. Small-group simulations focus on game-speed decisions and confidence under pressure. Each session layers in complexity—so you\'re always ready for the toughest defensive plays.'
  },
  {
    id: 'aces-circle',
    title: "Ace's Circle Pod",
    icon: <Target className="w-8 h-8" />,
    tagline: 'Pitching Fundamentals & Strategy',
    description: 'Master the craft of the circle, combining power, precision, and strategy in every pitch.',
    learns: [
      'Proper Grip & Wrist Snap',
      'Body Alignment & Leg Drive',
      'Movement Pitches (Drop, Curve, Rise, etc.)',
      'Pitch Selection & Game Management'
    ],
    uniqueness: 'We integrate video-based feedback and advanced drills that target mechanics, accuracy, and pitch variation. Sessions are structured so pitchers develop a strong mental approach while refining each type of pitch they throw. This leads to total command on the mound.'
  },
  {
    id: 'diamond-commander',
    title: 'Diamond Commander Pod',
    icon: <Crown className="w-8 h-8" />,
    tagline: 'Catcher Fundamentals & Leadership',
    description: 'Lead from behind the plate—master receiving, controlling the run game, and team leadership.',
    learns: [
      'Proper Stance & Receiving Techniques',
      'Fast & Efficient Throw-Downs',
      'Blocking & Footwork Drills',
      'Game Management & Pitch Calling'
    ],
    uniqueness: 'Catcher is the heartbeat of the team, and our focused approach balances the physical and mental responsibilities of the position. From pop-time drills to calling a smart game, you\'ll learn how to command every aspect of the diamond.'
  }
];

const TrainingPods = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-primary mb-6">
            Introducing Our Skill-Focused "Pods"
          </h2>
          <p className="text-lg text-gray-600">
            Our private coaching sessions are organized into distinct "Pods," each dedicated to a core area of softball. 
            By specializing in these targeted pods, we ensure every athlete gets the focused, expert attention they need.
          </p>
        </div>

        {/* Pods Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {pods.map((pod) => (
            <div 
              key={pod.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Pod Header */}
              <div className="bg-brand-secondary bg-opacity-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-secondary rounded-lg text-white">
                    {pod.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-secondary">
                      {pod.title}
                    </h3>
                    <p className="text-brand-muted">{pod.tagline}</p>
                  </div>
                </div>
                <p className="text-gray-600">{pod.description}</p>
              </div>

              {/* Pod Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    What You'll Learn:
                  </h4>
                  <ul className="space-y-2">
                    {pod.learns.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    Why It's Unique:
                  </h4>
                  <p className="text-gray-600">{pod.uniqueness}</p>
                </div>

                {/* CTA Button */}
                <button className="mt-6 w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300">
                  Join {pod.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingPackages = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-brand-primary mb-16">
          Training Programs
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Single Session */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Trophy className="w-12 h-12 text-brand-primary mb-6" />
            <h3 className="text-xl font-bold mb-4">Single Session</h3>
            <p className="text-gray-600 mb-6">
              Perfect for focused skill work or trying out our coaching approach.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>60-minute session</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Video analysis</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Skill assessment</span>
              </li>
            </ul>
            <div className="text-2xl font-bold mb-4">$85</div>
            <Link
              to="/training/signup?type=single"
              className="inline-block w-full text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Monthly Package */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-brand-primary relative">
            <div className="absolute -top-3 right-8 bg-brand-primary text-white px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <Crown className="w-12 h-12 text-brand-primary mb-6" />
            <h3 className="text-xl font-bold mb-4">Monthly Package</h3>
            <p className="text-gray-600 mb-6">
              Consistent training for serious improvement and skill development.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>4 sessions per month</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Progress tracking</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Custom training plan</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Priority scheduling</span>
              </li>
            </ul>
            <div className="text-2xl font-bold mb-4">$299/month</div>
            <Link
              to="/training/signup?type=monthly"
              className="inline-block w-full text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Season Package */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Shield className="w-12 h-12 text-brand-primary mb-6" />
            <h3 className="text-xl font-bold mb-4">Season Package</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive training throughout your competitive season.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>12-week program</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Weekly sessions</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Game analysis</span>
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-brand-primary mr-2" />
                <span>Mental preparation</span>
              </li>
            </ul>
            <div className="text-2xl font-bold mb-4">$799/season</div>
            <Link
              to="/training/signup?type=season"
              className="inline-block w-full text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-600">
          Bonus: All packages unlock member‑only facility hours and discounted access to Elite Clinics.
        </p>
      </div>
    </section>
  );
};

const features = [
  {
    icon: <Target className="w-8 h-8 text-brand-primary" />,
    title: "Custom Development Plan",
    description: "Every athlete is unique. We tailor each training plan to fit your goals, skill level, and schedule."
  },
  {
    icon: <Users className="w-8 h-8 text-brand-primary" />,
    title: "Progress Reports & Feedback",
    description: "Receive real-time feedback and video analysis after every session. Track your improvement week by week."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-brand-primary" />,
    title: "Homework & Practice Guidance",
    description: "We'll provide you with drills, assignments, and resources to keep you on track between coaching sessions."
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
    <PageLayout>
      {/* Hero Banner */}
      <div className="relative h-[700px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/c5170fe9c50412806a6e9c20a7c20aa3-large.jpeg"
          alt="BasesCovered Softball Training"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transform Your Game with Training That Delivers Results
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
              Join the premier softball training program that combines expert coaching, 
              strategic planning, technology, and proven development methods.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/auth?mode=register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                to="/programs"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the landing page content */}
      <TrainingPods />
      <PricingPackages />
      
     
      
      <Footer />
    </PageLayout>
  );
}