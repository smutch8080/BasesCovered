import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ClinicRegistration } from '../../types/clinic';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  clinicId: string;
  registrations: ClinicRegistration[];
  onRegistrationsUpdated: (registrations: ClinicRegistration[]) => void;
}

export const RegistrationManagement: React.FC<Props> = ({
  clinicId,
  registrations,
  onRegistrationsUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (registrationId: string, newStatus: 'confirmed' | 'cancelled' | 'waitlisted') => {
    try {
      setIsLoading(true);
      const registrationRef = doc(db, 'clinic_registrations', registrationId);
      await updateDoc(registrationRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      const updatedRegistrations = registrations.map(reg =>
        reg.id === registrationId ? { ...reg, status: newStatus, updatedAt: new Date() } : reg
      );
      onRegistrationsUpdated(updatedRegistrations);
      
      toast.success('Registration status updated');
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Failed to update registration');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
  const confirmedRegistrations = registrations.filter(reg => reg.status === 'confirmed');
  const waitlistedRegistrations = registrations.filter(reg => reg.status === 'waitlisted');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-brand-primary" />
        <h2 className="text-lg font-semibold text-gray-800">Registration Management</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-medium">Confirmed</h3>
          </div>
          <p className="text-2xl font-bold text-green-800">{confirmedRegistrations.length}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-800">{pendingRegistrations.length}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-medium">Waitlisted</h3>
          </div>
          <p className="text-2xl font-bold text-orange-800">{waitlistedRegistrations.length}</p>
        </div>
      </div>

      {/* Registration Lists */}
      <div className="space-y-6">
        {/* Pending Registrations */}
        {pendingRegistrations.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Pending Registrations</h3>
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {registration.participantInfo.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Age: {registration.participantInfo.age} • 
                        Level: {registration.participantInfo.skillLevel}
                      </p>
                      {registration.podId && (
                        <p className="text-sm text-brand-primary mt-1">
                          Requested Pod: {registration.podId}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(registration.id, 'confirmed')}
                        disabled={isLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(registration.id, 'waitlisted')}
                        disabled={isLoading}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Waitlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(registration.id, 'cancelled')}
                        disabled={isLoading}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Registrations */}
        {confirmedRegistrations.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Confirmed Registrations</h3>
            <div className="space-y-4">
              {confirmedRegistrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {registration.participantInfo.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Age: {registration.participantInfo.age} • 
                        Level: {registration.participantInfo.skillLevel}
                      </p>
                      {registration.podId && (
                        <p className="text-sm text-brand-primary mt-1">
                          Assigned Pod: {registration.podId}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirmed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waitlisted Registrations */}
        {waitlistedRegistrations.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Waitlisted Registrations</h3>
            <div className="space-y-4">
              {waitlistedRegistrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {registration.participantInfo.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Age: {registration.participantInfo.age} • 
                        Level: {registration.participantInfo.skillLevel}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(registration.id, 'confirmed')}
                      disabled={isLoading}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Move to Confirmed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {registrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No registrations yet
          </div>
        )}
      </div>
    </div>
  );
};