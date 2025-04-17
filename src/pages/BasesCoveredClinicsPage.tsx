import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Timer, 
  Video, 
  Trophy, 
  Brain,
  ChevronRight, 
  Calendar,
  Star,
  ArrowUpRight,
  Activity,
  Target,
  Gauge
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';

const BasesCoveredClinicsPage = () => {
  return (
    <PageLayout className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[700px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/34a9c72c347bed9d2b8259333503217a-xxlarge.jpeg"
          alt="BasesCovered Elite Clinics"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Elite Softball Clinics
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
              Intensive training sessions led by elite coaches and college players. Master fundamentals and advanced techniques in a focused environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/clinics/register"
                className="px-8 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg"
              >
                Register Now
              </Link>
              <Link
                to="/clinics/schedule"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes an Elite Clinic Different */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes an Elite Clinic Different?</h2>
          
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <img 
                  src="/assets/images/Elite Clinic/c5170fe9c50412806a6e9c20a7c20aa3-large.jpeg" 
                  alt="Elite clinic training"
                  className="rounded-lg shadow-md w-full h-[400px] object-cover"
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <Timer className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Pod‑Style Stations</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Athletes rotate through hitting, fielding, pitching, and speed pods in 20‑minute bursts led by specialists.</p>
                  <p className="text-brand-primary font-medium">Keeps intensity high, maximizes reps, and lets each coach dive deep on one skill set.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Live‑Rep Progressions</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Drills build from fundamentals to game‑speed reps within the same session.</p>
                  <p className="text-brand-primary font-medium">Players immediately apply mechanics under pressure, locking in muscle memory.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <img 
                  src="/assets/images/Elite Clinic/433b91b742b98351aa72c3f1738f4868-large.jpeg" 
                  alt="Elite clinic instruction"
                  className="rounded-lg shadow-md w-full h-[400px] object-cover"
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Video & Tech Integration</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Rapsodo® bullpens, Blast Motion® swing sensors, and pocket radar on every cage.</p>
                  <p className="text-brand-primary font-medium">Real‑time data plus coach feedback = "aha!" moments that translate to the field.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Competition Elements</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Exit‑velo leaderboards, accuracy challenges, golden‑glove relays, and pitch‑off finals.</p>
                  <p className="text-brand-primary font-medium">Gamification fuels effort and shows athletes exactly where they rank—and how to climb.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Clinic Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Previous Clinic Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img 
                src="/assets/images/Elite Clinic/3ff1a653d7b8695717a934be302e6810-large.jpeg" 
                alt="Winter Power-Up highlights"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Winter Power‑Up (2024)</h3>
                    <p className="text-sm text-gray-500">Bat speed & lower‑body power</p>
                  </div>
                </div>
                <p className="text-brand-primary font-medium">Avg. exit velo jump: +4 mph in 4 weeks; 92% of hitters reported better timing vs. velo machines.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img 
                src="/assets/images/Elite Clinic/325e908528730891e9fab447a36c9f4b-large.jpeg" 
                alt="Ace Accelerator highlights"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Ace Accelerator (Spring 2024)</h3>
                    <p className="text-sm text-gray-500">Pitching mechanics & movement</p>
                  </div>
                </div>
                <p className="text-brand-primary font-medium">11 pitchers added a new movement pitch; overall strike‑zone command improved by 17% on Rapsodo reports.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img 
                src="/assets/images/Elite Clinic/307fa4d52eeee0601e567163190904ee-large.jpeg" 
                alt="Golden Glove Weekend highlights"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Golden Glove Weekend (Summer 2024)</h3>
                    <p className="text-sm text-gray-500">Infield & outfield defense</p>
                  </div>
                </div>
                <p className="text-brand-primary font-medium">Team relay record broken twice; 8 athletes shaved 0.18 s off transfer‑to‑throw times.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Formats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Clinic Formats</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/2bd46f0d09d2252fe0370dfc488575eb-large.jpeg" 
                alt="One-Day Intensive"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-2">One‑Day Intensive</h3>
                <div className="text-gray-600 mb-4">
                  <p className="mb-2">3‑4 hrs</p>
                  <p className="mb-2">24–32 athletes</p>
                </div>
                <p className="text-brand-primary font-medium">Ideal For: Specific skill surge during season breaks</p>
              </div>
            </div>
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/1b13cc1b735c1691cbe7dd7b0343063b-large.jpeg" 
                alt="Weekend Camp"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-2">Weekend Camp</h3>
                <div className="text-gray-600 mb-4">
                  <p className="mb-2">6–8 hrs over Sat/Sun</p>
                  <p className="mb-2">30–40 athletes</p>
                </div>
                <p className="text-brand-primary font-medium">Ideal For: Pre‑season tune‑ups & multi‑skill immersion</p>
              </div>
            </div>
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/128d38a2c324053d4e848d9e45ad9bf8-large.jpeg" 
                alt="Mini-Clinic Series"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-2">Mini‑Clinic Series</h3>
                <div className="text-gray-600 mb-4">
                  <p className="mb-2">90‑min sessions, 3‑week run</p>
                  <p className="mb-2">12–16 athletes</p>
                </div>
                <p className="text-brand-primary font-medium">Ideal For: Deep dive on specialty skills</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Clinics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <img 
              src="/assets/images/Elite Clinic/113a4838f06b259b2c6b66505ee769b1-large.jpeg" 
              alt="Upcoming clinic preview"
              className="rounded-lg shadow-md h-[400px] object-cover"
            />
            <img 
              src="/assets/images/Elite Clinic/0f9bd43082cbd57e36f0281aedd13803-large.jpeg" 
              alt="Training session preview"
              className="rounded-lg shadow-md h-[400px] object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold text-center mb-12">Upcoming Clinics</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 font-semibold text-gray-600 border-b">
                <div>Date</div>
                <div className="col-span-2">Clinic</div>
                <div>Ages</div>
                <div>Open Spots</div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                  <div>May 18</div>
                  <div className="col-span-2">Pre‑Summer Launch Pad (Hitting + Speed)</div>
                  <div>10U–14U</div>
                  <div className="flex items-center gap-2">
                    <span>11</span>
                    <Link to="/clinics/register" className="text-brand-primary hover:text-brand-primary-dark">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                  <div>Jun 15–16</div>
                  <div className="col-span-2">Elite Pitching Lab</div>
                  <div>12U–16U</div>
                  <div className="flex items-center gap-2">
                    <span>8</span>
                    <Link to="/clinics/register" className="text-brand-primary hover:text-brand-primary-dark">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                  <div>Jul 13</div>
                  <div className="col-span-2">Defensive Domination</div>
                  <div>8U–12U</div>
                  <div className="flex items-center gap-2">
                    <span>15</span>
                    <Link to="/clinics/register" className="text-brand-primary hover:text-brand-primary-dark">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                  <div>Aug 10–11</div>
                  <div className="col-span-2">Fall Tryout Prep Camp</div>
                  <div>10U–16U</div>
                  <div className="flex items-center gap-2">
                    <span>20</span>
                    <Link to="/clinics/register" className="text-brand-primary hover:text-brand-primary-dark">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center mt-6 text-gray-600 italic">
              Early‑bird perk: Register 30 days out and receive a free Blast Motion swing credit or Rapsodo bullpen report (your choice).
            </p>
          </div>
        </div>
      </section>

      {/* How to Register */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How to Register</h2>
          <div className="max-w-2xl mx-auto">
            <ol className="space-y-6">
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
                <p>Pick your clinic above.</p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">2</div>
                <p>Click "Reserve My Spot." (All major cards + ACH accepted; payment plans on camps over $200.)</p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">3</div>
                <p>Check your inbox for confirmation plus a printable prep guide.</p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">4</div>
                <p>Show up ready to grind—we'll supply the gear, data, and high‑fives.</p>
              </li>
            </ol>
            <div className="text-center mt-12">
              <Link
                to="/clinics/register"
                className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                View Available Clinics
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BasesCoveredClinicsPage; 