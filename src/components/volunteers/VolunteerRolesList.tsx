import React from 'react';
import { VolunteerRole } from '../../types/volunteer';
import { Users, Edit, Trash2 } from 'lucide-react';

interface Props {
  roles: VolunteerRole[];
  onEdit?: (role: VolunteerRole) => void;
  onDelete?: (roleId: string) => void;
  isEditable?: boolean;
}

export const VolunteerRolesList: React.FC<Props> = ({
  roles,
  onEdit,
  onDelete,
  isEditable = false
}) => {
  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No volunteer roles defined yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div
          key={role.id}
          className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{role.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{role.description}</p>
              
              {(role.requiredSkills?.length || role.minAge) && (
                <div className="mt-2 space-x-2">
                  {role.requiredSkills?.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.minAge && (
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      Age {role.minAge}+
                    </span>
                  )}
                </div>
              )}
            </div>

            {isEditable && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit?.(role)}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete?.(role.id)}
                  className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};