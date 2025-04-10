import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, addDoc, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clinic, ClinicRegistration } from '../../types/clinic';
import { useAuth } from '../../contexts/AuthContext';
import { sendClinicRegistrationConfirmation } from '../../services/notifications/events';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clinic: Clinic;
  onRegistrationComplete: (registration: ClinicRegistration) => void;
}

export const ClinicRegistrationForm: React.FC<Props> = ({
  isOpen,
  onClose,
  clinic,
  onRegistrationComplete
}) => {
  const { currentUser } = useAuth();
  const [selectedPod, setSelectedPod] = useState<string>('');
  const [participantInfo, setParticipantInfo] = useState({
    name: currentUser?.displayName || '',
    age: '',
    skillLevel: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validate max participants if set
      if (clinic.maxParticipants && clinic.currentParticipants >= clinic.maxParticipants) {
        toast.error('Sorry, this clinic is full');
        return;
      }

      // Create registration data
      const now = new Date();
      const registrationData = {
        clinicId: clinic.id,
        userId: currentUser?.id || null,
        userEmail: currentUser?.email || null,
        userName: participantInfo.name,
        podId: selectedPod || null,
        status: clinic.maxParticipants && clinic.currentParticipants >= clinic.maxParticipants 
          ? 'waitlisted' 
          : 'pending',
        participantInfo: {
          name: participantInfo.name,
          age: parseInt(participantInfo.age),
          skillLevel: participantInfo.skillLevel,
          emergencyContact: participantInfo.emergencyContact,
          medicalInfo: participantInfo.medicalInfo || null
        },
        paymentStatus: clinic.fee ? 'pending' : null,
        paymentAmount: clinic.fee || null,
        paymentDate: null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      // Save registration to Firestore
      const docRef = await addDoc(collection(db, 'clinic_registrations'), registrationData);

      // Update clinic participant count if not waitlisted
      if (registrationData.status !== 'waitlisted') {
        const clinicRef = doc(db, 'clinics', clinic.id);
        await updateDoc(clinicRef, {
          currentParticipants: increment(1),
          updatedAt: Timestamp.fromDate(now)
        });
      }

      // Send confirmation notification if user is authenticated
      if (currentUser) {
        await sendClinicRegistrationConfirmation(
          currentUser.id,
          currentUser.email,
          currentUser.displayName,
          clinic.name,
          clinic.startDate,
          clinic.location.address
        );
      }

      // Create registration object for UI update
      const registration: ClinicRegistration = {
        ...registrationData,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };

      onRegistrationComplete(registration);
      onClose();
      
      toast.success(
        registrationData.status === 'waitlisted'
          ? 'Added to waitlist successfully'
          : 'Registration submitted successfully'
      );

      // Reset form
      setSelectedPod('');
      setParticipantInfo({
        name: currentUser?.displayName || '',
        age: '',
        skillLevel: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        medicalInfo: ''
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Register for {clinic.name}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Name
              </label>
              <input
                type="text"
                value={participantInfo.name}
                onChange={(e) => setParticipantInfo(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={participantInfo.age}
                  onChange={(e) => setParticipantInfo(prev => ({
                    ...prev,
                    age: e.target.value
                  }))}
                  required
                  min="5"
                  max="18"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={participantInfo.skillLevel}
                  onChange={(e) => setParticipantInfo(prev => ({
                    ...prev,
                    skillLevel: e.target.value
                  }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select level...</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {clinic.pods.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Pod (Optional)
                </label>
                <select
                  value={selectedPod}
                  onChange={(e) => setSelectedPod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">No pod preference</option>
                  {clinic.pods.map((pod) => (
                    <option key={pod.id} value={pod.id}>
                      {pod.name} - {pod.focusArea}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Emergency Contact</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={participantInfo.emergencyContact.name}
                  onChange={(e) => setParticipantInfo(prev => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      name: e.target.value
                    }
                  }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={participantInfo.emergencyContact.phone}
                  onChange={(e) => setParticipantInfo(prev => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      phone: e.target.value
                    }
                  }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={participantInfo.emergencyContact.relationship}
                  onChange={(e) => setParticipantInfo(prev => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      relationship: e.target.value
                    }
                  }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Information (Optional)
              </label>
              <textarea
                value={participantInfo.medicalInfo}
                onChange={(e) => setParticipantInfo(prev => ({
                  ...prev,
                  medicalInfo: e.target.value
                }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Any medical conditions, allergies, or special needs we should be aware of"
              />
            </div>

            {clinic.fee && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">Registration Fee: ${clinic.fee}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Payment will be required to confirm your registration
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};