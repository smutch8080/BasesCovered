import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clinic } from '../types/clinic';
import { ClinicWizard } from '../components/clinics/ClinicWizard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function NewClinicPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (clinicData: Omit<Clinic, 'id'>) => {
    if (!currentUser) return;

    try {
      // Create the clinic document
      const docRef = await addDoc(collection(db, 'clinics'), {
        ...clinicData,
        currentParticipants: 0,
        fee: clinicData.fee || null,
        contactPhone: clinicData.contactPhone?.trim() || null,
        createdBy: currentUser.id,
        status: clinicData.status || 'draft',
        pods: [],
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success('Clinic created successfully');
      navigate(`/clinics/${docRef.id}`);
    } catch (error) {
      console.error('Error creating clinic:', error);
      toast.error('Failed to create clinic');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/clinics"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Clinics
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Clinic</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <ClinicWizard onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default NewClinicPage;