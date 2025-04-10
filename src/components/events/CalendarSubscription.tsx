import React, { useState } from 'react';
import { Calendar, Copy, Download } from 'lucide-react';
import { generateCalendar, generateCalendarUrl } from '../../services/events/calendar';
import { Event } from '../../types/events';
import toast from 'react-hot-toast';

interface Props {
  events: Event[];
  teamId?: string;
}

export const CalendarSubscription: React.FC<Props> = ({ events, teamId }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownloadCalendar = () => {
    try {
      const calendar = generateCalendar(events);
      const blob = new Blob([calendar], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${teamId ? 'team' : 'community'}-events.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Calendar downloaded successfully');
    } catch (error) {
      console.error('Error downloading calendar:', error);
      toast.error('Failed to download calendar');
    }
  };

  const handleCopyUrl = () => {
    try {
      const url = generateCalendarUrl(teamId);
      navigator.clipboard.writeText(url);
      toast.success('Calendar URL copied to clipboard');
    } catch (error) {
      console.error('Error copying calendar URL:', error);
      toast.error('Failed to copy calendar URL');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Calendar Subscription</h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-brand-primary hover:opacity-90"
        >
          {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleDownloadCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Calendar
          </button>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
              hover:bg-gray-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Subscribe URL
          </button>
        </div>

        {showInstructions && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-gray-800">How to Subscribe:</h4>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Google Calendar:</h5>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                <li>Click "Copy Subscribe URL" above</li>
                <li>Open Google Calendar</li>
                <li>Click the "+" next to "Other calendars"</li>
                <li>Select "From URL"</li>
                <li>Paste the URL and click "Add calendar"</li>
              </ol>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Apple Calendar:</h5>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                <li>Click "Copy Subscribe URL" above</li>
                <li>Open Calendar app</li>
                <li>Go to File &gt; New Calendar Subscription</li>
                <li>Paste the URL and click Subscribe</li>
              </ol>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Outlook:</h5>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                <li>Click "Copy Subscribe URL" above</li>
                <li>Open Outlook Calendar</li>
                <li>Right-click "Add Calendar" &gt; "From Internet"</li>
                <li>Paste the URL and click "OK"</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};