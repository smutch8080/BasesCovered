import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clinic, ClinicRegistration } from '../types/clinic';
import { useAuth } from '../contexts/AuthContext';
import { ClinicDetailView } from '../components/clinics/ClinicDetailView';
import { RegistrationManagement } from '../components/clinics/RegistrationManagement';
import { ResourceManagement } from '../components/clinics/ResourceManagement';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function ClinicDetailPage() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [registrations, setRegistrations] = useState<ClinicRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadClinicData = async () => {
      if (!clinicId) return;

      try {
        setIsLoading(true);
        const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
        
        if (clinicDoc.exists()) {
          const data = clinicDoc.data();
          const clinicData = {
            ...data,
            id: clinicDoc.id,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Clinic;
          
          setClinic(clinicData);

          // Load registrations if user is the clinic creator or admin
          if (currentUser && (currentUser.id === data.createdBy || currentUser.role === 'admin')) {
            const registrationsRef = collection(db, 'clinic_registrations');
            const q = query(registrationsRef, where('clinicId', '==', clinicId));
            const registrationsSnapshot = await getDocs(q);
            
            const loadedRegistrations: ClinicRegistration[] = [];
            registrationsSnapshot.forEach(doc => {
              const regData = doc.data();
              loadedRegistrations.push({
                ...regData,
                id: doc.id,
                createdAt: regData.createdAt.toDate(),
                updatedAt: regData.updatedAt.toDate(),
                paymentDate: regData.paymentDate?.toDate()
              } as ClinicRegistration);
            });

            setRegistrations(loadedRegistrations);
          }
        } else {
          toast.error('Clinic not found');
        }
      } catch (error) {
        console.error('Error loading clinic:', error);
        toast.error('Unable to load clinic details');
      } finally {
        setIsLoading(false);
      }
    };

    loadClinicData();
  }, [clinicId, currentUser]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Clinic not found</p>
      </div>
    );
  }

  const isClinicCoach = currentUser && (
    currentUser.id === clinic.createdBy || 
    currentUser.role === 'admin'
  );

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
      </div>

      <div className="space-y-8">
        <ClinicDetailView
          clinic={clinic}
          onClinicUpdated={setClinic}
          registrations={registrations}
        />

        {isClinicCoach && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <RegistrationManagement
                clinicId={clinic.id}
                registrations={registrations}
                onRegistrationsUpdated={setRegistrations}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <ResourceManagement
                clinic={clinic}
                onClinicUpdated={setClinic}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClinicDetailPage;