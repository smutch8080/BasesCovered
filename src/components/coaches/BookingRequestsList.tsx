import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BookingRequest } from '../../types/booking';
import { Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  coachId: string;
}

export const BookingRequestsList: React.FC<Props> = ({ coachId }) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const requestsRef = collection(db, 'booking_requests');
        const q = query(
          requestsRef,
          where('coachId', '==', coachId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedRequests: BookingRequest[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedRequests.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as BookingRequest);
        });

        setRequests(loadedRequests);
      } catch (error) {
        console.error('Error loading booking requests:', error);
        toast.error('Unable to load booking requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [coachId]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'declined') => {
    try {
      const requestRef = doc(db, 'booking_requests', requestId);
      await updateDoc(requestRef, {
        status,
        updatedAt: new Date()
      });

      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status, updatedAt: new Date() } : req
      ));

      toast.success(`Booking request ${status}`);
    } catch (error) {
      console.error('Error updating booking request:', error);
      toast.error('Failed to update booking request');
    }
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading booking requests...</p>;
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const pastRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{request.userName}</p>
                    <p className="text-sm text-gray-500">
                      {request.serviceType} Lesson • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Approve request"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'declined')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Decline request"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{request.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Past Requests</h3>
          <div className="space-y-4">
            {pastRequests.map((request) => (
              <div
                key={request.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  request.status === 'approved' ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{request.userName}</p>
                    <p className="text-sm text-gray-500">
                      {request.serviceType} Lesson • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{request.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No booking requests yet</p>
        </div>
      )}
    </div>
  );
};