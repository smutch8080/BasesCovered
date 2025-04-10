import React, { useState } from 'react';
import { useDebug } from '../../contexts/DebugContext';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const debug = useDebug();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!debug.isEnabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg max-w-md">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            <span className="font-medium">Debug Panel</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {isExpanded && (
          <div className="p-4 border-t border-gray-700 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Authentication</h3>
              <pre className="text-xs bg-gray-800 p-2 rounded">
                {JSON.stringify(debug.authInfo, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Role Permissions</h3>
              <pre className="text-xs bg-gray-800 p-2 rounded">
                {JSON.stringify(debug.permissions.role, null, 2)}
              </pre>
            </div>

            {Object.keys(debug.permissions.teams).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Team Permissions</h3>
                <pre className="text-xs bg-gray-800 p-2 rounded">
                  {JSON.stringify(debug.permissions.teams, null, 2)}
                </pre>
              </div>
            )}

            {Object.keys(debug.permissions.events).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Event Permissions</h3>
                <pre className="text-xs bg-gray-800 p-2 rounded">
                  {JSON.stringify(debug.permissions.events, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};