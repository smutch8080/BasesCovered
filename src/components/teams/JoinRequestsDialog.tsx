import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Team, JoinRequest } from '../../types/team';
import { Check, X } from 'lucide-react';
import ParentAssignmentDialog from './ParentAssignmentDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onTeamUpdated: (team: Team) => void;
}

export default function JoinRequestsDialog({
  isOpen,
  onClose,
  team,
  onTeamUpdated
}: Props) {
  const [selectedParent, setSelectedParent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set());

  const pendingRequests = team.joinRequests?.filter(
    request => request.status === 'pending'
  ) || [];

  const handleRequestAction = async (request: JoinRequest, status: 'approved' | 'declined') => {
    if (!team.id || processingRequestIds.has(request.id)) {
      return;
    }

    try {
      // Add request ID to processing set
      setProcessingRequestIds(prev => new Set(prev).add(request.id));

      // Call Cloud Function to handle the join request
      const functions = getFunctions();
      const handleJoinRequest = httpsCallable(functions, 'handleJoinRequest');
      
      const result = await handleJoinRequest({
        teamId: team.id,
        requestId: request.id,
        status
      });
      
      const response = result.data as { 
        success: boolean;
        message?: string;
        updatedTeam?: Team;
      };
      
      if (response.success && response.updatedTeam) {
        // Update the local team state with the updated team from the server
        onTeamUpdated(response.updatedTeam);
        
        toast.success(
          status === 'approved'
            ? `${request.userName} has been added to the team`
            : `Request from ${request.userName} has been declined`
        );
      } else {
        throw new Error(response.message || 'Failed to process join request');
      }
    } catch (error: any) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'declining'} request:`, error);
      
      let errorMessage = 'An error occurred while processing the request';
      if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to manage join requests';
      }
      
      toast.error(errorMessage);
    } finally {
      // Remove request ID from processing set
      setProcessingRequestIds(prev => {
        const updated = new Set(prev);
        updated.delete(request.id);
        return updated;
      });
    }
  };

  // Helper function to format dates safely
  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    
    // Handle Firestore timestamp objects
    if (date && typeof date === 'object' && 'toDate' in date) {
      return format(date.toDate(), 'MMM d, yyyy');
    }
    
    // Handle regular Date objects
    if (date instanceof Date) {
      return format(date, 'MMM d, yyyy');
    }
    
    // Handle string dates (ISO format)
    if (typeof date === 'string') {
      try {
        return format(new Date(date), 'MMM d, yyyy');
      } catch (error) {
        console.error('Error formatting date string:', error);
        return 'Invalid date';
      }
    }
    
    return 'Invalid date';
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <Dialog.Title className="text-xl font-bold mb-4">
              Team Join Requests
            </Dialog.Title>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending join requests</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Message
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {request.userName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {request.userRole === 'parent' ? 'Parent' : 
                           request.userRole === 'coach' ? 'Coach' : 
                           request.userRole === 'player' ? 'Player' : 
                           request.userRole}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                          {request.message || <em>No message</em>}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleRequestAction(request, 'approved')}
                              disabled={processingRequestIds.has(request.id)}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50 p-1"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRequestAction(request, 'declined')}
                              disabled={processingRequestIds.has(request.id)}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                              title="Decline"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {selectedParent && (
        <ParentAssignmentDialog
          isOpen={!!selectedParent}
          onClose={() => setSelectedParent(null)}
          team={team}
          parentId={selectedParent.id}
          parentName={selectedParent.name}
          onTeamUpdated={onTeamUpdated}
        />
      )}
    </>
  );
};