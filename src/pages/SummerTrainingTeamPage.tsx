import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Target, 
  Trophy,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Award,
  ChevronRight,
  DollarSign,
  Timer,
  Gauge,
  Brain,
  Activity
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';

const SummerTrainingTeamPage = () => {
  return (
    <PageLayout className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[700px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/f71156e251258bde2684c1b5a65395b7-xxlarge.jpeg"
          alt="Summer Training Team"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Elite Summer Training Team
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
              Join our intensive summer program designed to transform dedicated players into elite athletes through expert coaching and competitive training.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/summer-team/apply"
                className="px-8 py-4 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg"
              >
                Apply Now
              </Link>
              <Link
                to="/summer-team/schedule"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                When the last out of spring is recorded, most teams shut down. Elite's Summer Practice Team ramps up. 
                We assemble dedicated athletes from 8U, 10U, 12U, 14U, and 16U into a single, high‑tempo training cohort 
                that meets weekly, mixes age groups for mentoring, and finishes every phase with live scrimmages. 
                The result? Players return to their fall clubs sharper, stronger, and more confident than ever.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <Timer className="w-8 h-8 text-brand-primary mb-2" />
                  <h3 className="font-semibold mb-1">Weekly Training</h3>
                  <p className="text-sm text-gray-600">Consistent development through structured sessions</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <Brain className="w-8 h-8 text-brand-primary mb-2" />
                  <h3 className="font-semibold mb-1">Skill Growth</h3>
                  <p className="text-sm text-gray-600">Focused improvement in all aspects</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-3 gap-4">
              <img 
                src="/assets/images/Elite Clinic/f71156e251258bde2684c1b5a65395b7-xxlarge.jpeg" 
                alt="Players in action"
                className="rounded-lg shadow-md"
              />
              <img 
                src="/assets/images/Elite Clinic/f11a84d74e0a63ec1cd30d03a03bcfe5-xxlarge.jpeg" 
                alt="Training session"
                className="rounded-lg shadow-md"
              />
              <img 
                src="/assets/images/Elite Clinic/8d4f72efafaa73714edb7fbe63f7186c-xxlarge.jpeg" 
                alt="Team practice"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Program Snapshot */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Program Snapshot</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y">
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Season Window</div>
                <div className="col-span-2">June 3 – August 9 (10 weeks)</div>
              </div>
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Practice Cadence</div>
                <div className="col-span-2">2 evenings / week · 90‑minute sessions</div>
              </div>
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Scrimmage Fridays</div>
                <div className="col-span-2">In‑house games every other week; invite‑only friendlies vs. local clubs</div>
              </div>
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Roster Size</div>
                <div className="col-span-2">
                  36–40 athletes total
                  <br />· 8U–10U Pod · 12U Pod · 14U–16U Pod
                </div>
              </div>
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Facility</div>
                <div className="col-span-2">Elite indoor HQ + rotating partner fields</div>
              </div>
              <div className="grid grid-cols-3 p-4">
                <div className="font-semibold">Fee</div>
                <div className="col-span-2">$425 (includes jersey, performance tee, & all scrimmage umpire fees)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <img 
                  src="/assets/images/Elite Clinic/439f8e77c452bd191b969613f2a65e2f-xxlarge.jpeg" 
                  alt="Training intensity"
                  className="rounded-lg shadow-md w-full h-[400px] object-cover"
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <h2 className="text-3xl font-bold">Why Join the Summer Practice Team?</h2>
                <div className="grid gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-brand-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Consistent Reps, Zero Travel Chaos</h3>
                    </div>
                    <p className="text-gray-600">Keep the glove warm and the swing grooved without weekend‑long tournaments and hotel bills.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-brand-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Cross‑Age Mentoring</h3>
                    </div>
                    <p className="text-gray-600">Older players model work‑ethic & leadership; younger players raise their ceiling faster.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <img 
                  src="/assets/images/Elite Clinic/34a9c72c347bed9d2b8259333503217a-xxlarge.jpeg" 
                  alt="Player development"
                  className="rounded-lg shadow-md w-full h-[400px] object-cover"
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <div className="grid gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-brand-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Live‑Game Situations</h3>
                    </div>
                    <p className="text-gray-600">Bi‑weekly scrimmages guarantee clutch reps you can't replicate in lessons alone.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-brand-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Position‑Specific Pods</h3>
                    </div>
                    <p className="text-gray-600">Athletes split into specialized tracks for focused training, then unite for team systems.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Flow */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Weekly Flow</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y">
                <div className="grid grid-cols-4 p-4">
                  <div className="font-semibold">0:00 – 0:15</div>
                  <div className="col-span-3">Dynamic warm‑up & athletic movement circuit</div>
                </div>
                <div className="grid grid-cols-4 p-4">
                  <div className="font-semibold">0:15 – 0:45</div>
                  <div className="col-span-3">Pod Work (hitting / fielding / pitching / catching)</div>
                </div>
                <div className="grid grid-cols-4 p-4">
                  <div className="font-semibold">0:45 – 1:25</div>
                  <div className="col-span-3">Team systems, situational reps, or scrimmage innings</div>
                </div>
                <div className="grid grid-cols-4 p-4">
                  <div className="font-semibold">1:25 – 1:30</div>
                  <div className="col-span-3">Cool‑down, stat recap, & goal setting</div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 italic text-center">
              Every second Friday, the full block becomes a 6‑inning scrimmage with umpires and live scoreboard.
            </p>
          </div>
        </div>
      </section>

      {/* Age Group Pods */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Age‑Group Pods & Coaching Assignments</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/550c30926488074aa342dccca6d2e4a1-xlarge.jpeg" 
                alt="Rookie Rise training"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="text-gray-600 space-y-2">
                <p><strong>Ages:</strong> 8U‑10U</p>
                <p><strong>Lead Coach:</strong> Coach Jenna (former D1 infielder)</p>
                <p><strong>Focus:</strong> Foundational mechanics • Confidence in game flow</p>
              </div>
            </div>
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/1d78558aef9bc3638b68928438e25cc0-xxlarge.jpeg" 
                alt="Future Force training"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="text-gray-600 space-y-2">
                <p><strong>Ages:</strong> 12U</p>
                <p><strong>Lead Coach:</strong> Coach Austin (Elite 12U HC)</p>
                <p><strong>Focus:</strong> Advanced fundamentals • Situational IQ • Basepath aggression</p>
              </div>
            </div>
            <div className="space-y-6">
              <img 
                src="/assets/images/Elite Clinic/07b802188a265c8b91fce879387abc61-xxlarge.jpeg" 
                alt="Varsity Vision training"
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
              <div className="text-gray-600 space-y-2">
                <p><strong>Ages:</strong> 14U‑16U</p>
                <p><strong>Lead Coach:</strong> Coach Kim (ex‑NAIA pitcher)</p>
                <p><strong>Focus:</strong> Velocity & power gain • College‑style drills • Leadership reps</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-gray-600 italic">
            Older pods regularly scrimmage down an age group to sharpen reaction speed; younger pods up a level to face faster tempo.
          </p>
        </div>
      </section>

      {/* Scrimmage Series */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <img 
              src="/assets/images/Elite Clinic/f78e08bb9e359eb401a141255a658f08-xxlarge.jpeg" 
              alt="Game action"
              className="rounded-lg shadow-md h-[300px] object-cover"
            />
            <img 
              src="/assets/images/Elite Clinic/f4b769f7a43d9534a3e7085827b39e30-large.jpeg" 
              alt="Team scrimmage"
              className="rounded-lg shadow-md h-[300px] object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold text-center mb-12">Scrimmage Series</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Black‑vs‑Gold In‑House Nights</h3>
              <p className="text-gray-600">Rotate rosters, keep stats, crown weekly MVPs.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Community Friendlies</h3>
              <p className="text-gray-600">Host or travel up to 30 min to face other competitive programs.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Skills Combine Finale (Aug 9)</h3>
              <p className="text-gray-600">Timed runs, exit‑velo stations, pop‑time leaderboards, and full scrimmage streamed for families.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0" />
                  <span>Custom practice jersey & numbered scrimmage top</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0" />
                  <span>Blast Motion swing sensor rental or Rapsodo bullpen report (choose one)</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0" />
                  <span>All facility fees, scrimmage umpire costs, and video access</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0" />
                  <span>Progress tracker with mid‑summer and final report card</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How to Secure a Roster Spot</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ol className="space-y-6">
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold">Apply Online</p>
                    <p className="text-gray-600">Quick form + recent team/rec references.</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold">Attend Evaluation Day</p>
                    <p className="text-gray-600">May 18 (skills plus 30‑min scrimmage).</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold">Roster Emails Sent</p>
                    <p className="text-gray-600">May 20; deposit due in 72 hrs to confirm.</p>
                  </div>
                </li>
              </ol>
            </div>
            <p className="mt-6 text-center text-gray-600 italic">
              Payment plans available. Need‑based scholarships are funded through our Play‑It‑Forward program—ask for details.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Apply for Summer Team
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SummerTrainingTeamPage; 