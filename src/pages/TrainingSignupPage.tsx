import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Users, Target, Crown, Zap, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { User as FirebaseUser } from 'firebase/auth';

interface AthleteInfo {
  name: string;
  age: number;
  seasonsPlayed: number;
  positions: string[];
  goals: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface TrainingSignup {
  userId: string;
  programType: 'one-time' | 'monthly';
  selectedPods: string[];
  athleteInfo: AthleteInfo;
  contactInfo: ContactInfo;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

type PartialTrainingSignup = {
  programType?: 'one-time' | 'monthly';
  selectedPods?: string[];
  athleteInfo?: Partial<AthleteInfo>;
  contactInfo?: Partial<ContactInfo>;
  status?: 'pending' | 'confirmed' | 'cancelled';
};

const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First Base',
  'Second Base',
  'Third Base',
  'Shortstop',
  'Left Field',
  'Center Field',
  'Right Field'
];

const TrainingSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PartialTrainingSignup>({
    programType: 'one-time',
    selectedPods: [],
    athleteInfo: {
      name: '',
      age: 0,
      seasonsPlayed: 0,
      positions: [],
      goals: ''
    },
    contactInfo: {
      email: currentUser?.email || '',
      phone: '',
      address: ''
    },
    status: 'pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to continue');
      return;
    }

    if (!formData.athleteInfo?.name || !formData.contactInfo?.email || !formData.contactInfo?.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const signupData: TrainingSignup = {
        userId: currentUser.uid,
        programType: formData.programType || 'one-time',
        selectedPods: formData.selectedPods || [],
        athleteInfo: {
          name: formData.athleteInfo.name,
          age: formData.athleteInfo.age || 0,
          seasonsPlayed: formData.athleteInfo.seasonsPlayed || 0,
          positions: formData.athleteInfo.positions || [],
          goals: formData.athleteInfo.goals || ''
        },
        contactInfo: {
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          address: formData.contactInfo.address || ''
        },
        createdAt: new Date(),
        status: formData.status || 'pending'
      };

      await addDoc(collection(db, 'training-signups'), signupData);
      toast.success('Training signup submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting signup:', error);
      toast.error('Failed to submit signup');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-primary">Select Your Program</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* One-Time Lesson */}
        <div 
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            formData.programType === 'one-time' 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-gray-200 hover:border-brand-primary/50'
          }`}
          onClick={() => setFormData(prev => ({ ...prev, programType: 'one-time' }))}
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-brand-primary" />
            <h3 className="text-xl font-semibold">One-Time Lesson</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Perfect for skill assessment or specific technique correction.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>60-minute intensive session</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>Video analysis included</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>Custom homework drills</span>
            </li>
          </ul>
          <div className="mt-4 text-2xl font-bold text-brand-primary">$85</div>
        </div>

        {/* Monthly Program */}
        <div 
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            formData.programType === 'monthly' 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-gray-200 hover:border-brand-primary/50'
          }`}
          onClick={() => setFormData(prev => ({ ...prev, programType: 'monthly' }))}
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-brand-primary" />
            <h3 className="text-xl font-semibold">Monthly Program</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Comprehensive training program for consistent improvement.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>4 sessions per month</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>Progress tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span>Priority scheduling</span>
            </li>
          </ul>
          <div className="mt-4 text-2xl font-bold text-brand-primary">$299/month</div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-primary">Select Training Pods</h2>
      <p className="text-gray-600">Choose one or more training pods to focus on specific skills.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            id: 'power-hitter',
            title: 'Power Hitter Pod',
            icon: <Zap className="w-6 h-6" />,
            description: 'Master batting mechanics and power generation'
          },
          {
            id: 'golden-glove',
            title: 'Golden Glove Pod',
            icon: <Shield className="w-6 h-6" />,
            description: 'Elite fielding and defensive tactics'
          },
          {
            id: 'aces-circle',
            title: "Ace's Circle Pod",
            icon: <Target className="w-6 h-6" />,
            description: 'Advanced pitching techniques'
          },
          {
            id: 'diamond-commander',
            title: 'Diamond Commander Pod',
            icon: <Crown className="w-6 h-6" />,
            description: 'Comprehensive catching skills'
          }
        ].map(pod => (
          <div 
            key={pod.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              formData.selectedPods?.includes(pod.id)
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-gray-200 hover:border-brand-primary/50'
            }`}
            onClick={() => {
              const pods = formData.selectedPods || [];
              setFormData(prev => ({
                ...prev,
                selectedPods: pods.includes(pod.id)
                  ? pods.filter(id => id !== pod.id)
                  : [...pods, pod.id]
              }));
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                {pod.icon}
              </div>
              <h3 className="text-lg font-semibold">{pod.title}</h3>
            </div>
            <p className="text-gray-600">{pod.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-primary">Athlete Information</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Athlete Name
          </label>
          <input
            type="text"
            value={formData.athleteInfo?.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              athleteInfo: { ...(prev.athleteInfo || {}), name: e.target.value }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            value={formData.athleteInfo?.age || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              athleteInfo: { ...(prev.athleteInfo || {}), age: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
            min="5"
            max="18"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seasons Played
          </label>
          <input
            type="number"
            value={formData.athleteInfo?.seasonsPlayed || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              athleteInfo: { ...(prev.athleteInfo || {}), seasonsPlayed: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Positions
          </label>
          <select
            multiple
            value={formData.athleteInfo?.positions || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData(prev => ({
                ...prev,
                athleteInfo: { ...(prev.athleteInfo || {}), positions: selected }
              }));
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
          >
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goals and Objectives
          </label>
          <textarea
            value={formData.athleteInfo?.goals}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              athleteInfo: { ...(prev.athleteInfo || {}), goals: e.target.value }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary h-32"
            placeholder="What do you hope to achieve through this training program?"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-primary">Contact Information</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.contactInfo?.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...(prev.contactInfo || {}), email: e.target.value }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.contactInfo?.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...(prev.contactInfo || {}), phone: e.target.value }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.contactInfo?.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...(prev.contactInfo || {}), address: e.target.value }
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Program Selection', 'Training Pods', 'Athlete Info', 'Contact Info'].map((title, index) => (
                <div key={title} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${step > index + 1 ? 'bg-green-500' : step === index + 1 ? 'bg-brand-primary' : 'bg-gray-300'}
                    text-white font-medium
                  `}>
                    {step > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden md:block">{title}</span>
                  {index < 3 && (
                    <div className="h-1 w-12 md:w-24 mx-2 bg-gray-200">
                      <div 
                        className="h-full bg-brand-primary transition-all"
                        style={{ width: step > index + 1 ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  Submit Registration
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingSignupPage; 