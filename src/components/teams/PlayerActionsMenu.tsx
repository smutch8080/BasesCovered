import React from 'react';
import { MoreHorizontal, Eye, FileText, ClipboardList, Trash2, Edit } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';

interface Props {
  teamId: string;
  player: {
    id: string;
    name: string;
  };
  onEdit: () => void;
  onRemove: () => void;
  onCreateReport: () => void;
  onViewReports: () => void;
  onCreatePlan: () => void;
}

export const PlayerActionsMenu: React.FC<Props> = ({
  teamId,
  player,
  onEdit,
  onRemove,
  onCreateReport,
  onViewReports,
  onCreatePlan
}) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right bg-white rounded-lg shadow-lg 
        ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 z-50">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`/teams/${teamId}/players/${player.id}`}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onEdit}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
              >
                <Edit className="w-4 h-4" />
                Edit Player
              </button>
            )}
          </Menu.Item>

          <div className="border-t border-gray-100 my-1" />

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onCreateReport}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
              >
                <FileText className="w-4 h-4" />
                Create Report
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onViewReports}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
              >
                <FileText className="w-4 h-4" />
                View Reports
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onCreatePlan}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
              >
                <ClipboardList className="w-4 h-4" />
                Create Plan
              </button>
            )}
          </Menu.Item>

          <div className="border-t border-gray-100 my-1" />

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onRemove}
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600`}
              >
                <Trash2 className="w-4 h-4" />
                Remove Player
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};