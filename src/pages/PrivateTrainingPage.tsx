import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Crown, Zap, BookOpen, Shield, Star, ChevronRight, Target, Award, Crosshair, Command } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';

const PrivateTrainingPage = () => {
  return (
    <PageLayout className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[700px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/2bd46f0d09d2252fe0370dfc488575eb-large.jpeg"
          alt="Private softball training session"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Private Training
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
              Because some goals need more than regular team reps. BasesCovered's Private Training gives your athlete laser‑focused coaching, state‑of‑the‑art tech, and a clear plan to level‑up.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/private-training/book"
                className="px-8 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg"
              >
                Book Session
              </Link>
              <Link
                to="/private-training/packages"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">How It Works</h2>
              <div className="grid gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quick Skills Assessment</h3>
                    <p className="text-gray-600">We benchmark current ability and set measurable goals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Choose Your Skill "Pod"</h3>
                    <p className="text-gray-600">Power Hitter · Golden Glove · Ace's Circle · Diamond Commander</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pick Your Program</h3>
                    <p className="text-gray-600">Choose the training program that fits your calendar and budget.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Train, Track, Repeat</h3>
                    <p className="text-gray-600">Get data‑driven feedback and homework after every session.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/assets/images/Elite Clinic/f11a84d74e0a63ec1cd30d03a03bcfe5-xxlarge.jpeg"
                alt="Training assessment"
                className="rounded-lg shadow-md w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skill Pods */}
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
            {/* Power Hitter Pod */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-brand-secondary bg-opacity-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-secondary rounded-lg text-white">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-secondary">
                      Power Hitter Pod
                    </h3>
                    <p className="text-brand-muted">Batting Fundamentals & Advanced Hitting Techniques</p>
                  </div>
                </div>
                <p className="text-gray-600">Master the art of hitting with focused training on mechanics, power generation, and mental approach.</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    What You'll Learn:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Proper Bat Grip & Swing Mechanics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Contact Point & Timing Drills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Power Generation & Plate Discipline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Mental Approach for Pressure Situations</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    Why It's Unique:
                  </h4>
                  <p className="text-gray-600">We merge foundational swing principles with individualized video analysis, ensuring each hitter maximizes bat speed and consistency. Expect specialized batting drills, real-time feedback, and a progressive plan that elevates contact to consistent power hitting.</p>
                </div>
                <Link
                  to="/training/signup?pod=power-hitter"
                  className="mt-6 w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 inline-block text-center"
                >
                  Join Power Hitter Pod
                </Link>
              </div>
            </div>

            {/* Golden Glove Pod */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-brand-secondary bg-opacity-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-secondary rounded-lg text-white">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-secondary">
                      Golden Glove Pod
                    </h3>
                    <p className="text-brand-muted">Fielding Essentials & Advanced Defensive Tactics</p>
                  </div>
                </div>
                <p className="text-gray-600">Premium defense training—catch everything and make the impossible look routine.</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    What You'll Learn:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Ready Position & Footwork Mastery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Quick Transfers & Accurate Throwing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Reading the Ball Off the Bat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Infield/Outfield Position-Specific Techniques</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    Why It's Unique:
                  </h4>
                  <p className="text-gray-600">Our Golden Glove approach trains mental sharpness alongside physical skill. Small-group simulations focus on game-speed decisions and confidence under pressure. Each session layers in complexity—so you're always ready for the toughest defensive plays.</p>
                </div>
                <Link
                  to="/training/signup?pod=golden-glove"
                  className="mt-6 w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 inline-block text-center"
                >
                  Join Golden Glove Pod
                </Link>
              </div>
            </div>

            {/* Ace's Circle Pod */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-brand-secondary bg-opacity-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-secondary rounded-lg text-white">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-secondary">
                      Ace's Circle Pod
                    </h3>
                    <p className="text-brand-muted">Pitching Fundamentals & Strategy</p>
                  </div>
                </div>
                <p className="text-gray-600">Master the craft of the circle, combining power, precision, and strategy in every pitch.</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    What You'll Learn:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Proper Grip & Wrist Snap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Body Alignment & Leg Drive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Movement Pitches (Drop, Curve, Rise, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Pitch Selection & Game Management</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    Why It's Unique:
                  </h4>
                  <p className="text-gray-600">We integrate video-based feedback and advanced drills that target mechanics, accuracy, and pitch variation. Sessions are structured so pitchers develop a strong mental approach while refining each type of pitch they throw. This leads to total command on the mound.</p>
                </div>
                <Link
                  to="/training/signup?pod=aces-circle"
                  className="mt-6 w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 inline-block text-center"
                >
                  Join Ace's Circle Pod
                </Link>
              </div>
            </div>

            {/* Diamond Commander Pod */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-brand-secondary bg-opacity-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-secondary rounded-lg text-white">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-secondary">
                      Diamond Commander Pod
                    </h3>
                    <p className="text-brand-muted">Catcher Fundamentals & Leadership</p>
                  </div>
                </div>
                <p className="text-gray-600">Lead from behind the plate—master receiving, controlling the run game, and team leadership.</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    What You'll Learn:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Proper Stance & Receiving Techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Fast & Efficient Throw-Downs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Blocking & Footwork Drills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-accent mt-2" />
                      <span className="text-gray-600">Game Management & Pitch Calling</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-brand-dark mb-3">
                    Why It's Unique:
                  </h4>
                  <p className="text-gray-600">Catcher is the heartbeat of the team, and our focused approach balances the physical and mental responsibilities of the position. From pop-time drills to calling a smart game, you'll learn how to command every aspect of the diamond.</p>
                </div>
                <Link
                  to="/training/signup?pod=diamond-commander"
                  className="mt-6 w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 inline-block text-center"
                >
                  Join Diamond Commander Pod
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-gray-600 italic">
            Not sure which pod fits? Your first visit includes a short evaluation so we can recommend the most impactful path.
          </p>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Training Programs</h2>
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
            Bonus: All packages unlock member‑only facility hours and discounted access to BasesCovered Clinics.
          </p>
        </div>
      </section>

      {/* Why Athletes See Faster Results */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="/assets/images/Elite Clinic/113a4838f06b259b2c6b66505ee769b1-large.jpeg"
                alt="Training results"
                className="rounded-lg shadow-md w-full h-[500px] object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">Why Athletes See Faster Results Here</h2>
              <div className="grid gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-3">Hyper‑Personalization</h3>
                  <p className="text-gray-600">Each drill, rep, and homework assignment is built for your goals.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-3">Tech</h3>
                  <p className="text-gray-600">Video analysis, swing analysis, app access for drills and continued work away from the field.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-3">Certified & Battle‑Tested Coaches</h3>
                  <p className="text-gray-600"> Experienced staff who coach and exhibit the BasesCovered philosophyevery day.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-3">Mindset Built‑In</h3>
                  <p className="text-gray-600">Confidence, routine, and game‑IQ training are woven into every session.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-3">Clear Metrics, Visible Growth</h3>
                  <p className="text-gray-600">Track exit velo, pop‑time, command percentage, and more from lesson one.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Train */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ready to Train?</h2>
          <div className="max-w-lg mx-auto">
            <ol className="space-y-4">
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
                <p>Select a Program above.</p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">2</div>
                <p>Claim your spot using our live calendar.</p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">3</div>
                <p>Show up ready to work. We'll handle the rest.</p>
              </li>
            </ol>
            <div className="text-center mt-8">
              <Link
                to="/training/signup"
                className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Get Started Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivateTrainingPage; 