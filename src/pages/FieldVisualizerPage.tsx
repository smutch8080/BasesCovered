import React, { useState } from 'react';
import { Field } from '../components/situational/Field';
import { Position } from '../types/situational';
import { Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

function FieldVisualizerPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleSaveImage = () => {
    try {
      const svg = document.querySelector('.field-visualizer svg') as SVGSVGElement;
      if (!svg) return;

      // Create a data URL from the SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'field-setup.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Field setup saved successfully');
    } catch (error) {
      console.error('Error saving field setup:', error);
      toast.error('Failed to save field setup');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Softball Field Setup',
          text: 'Check out my softball field setup!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Softball Field Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Create and visualize softball field positions and plays. Add players, runners, 
            and balls to the field, then move them around to demonstrate plays and strategies.
          </p>
        </div>

        {/* Field Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="field-visualizer">
            <Field
              positions={positions}
              onPositionChange={setPositions}
              isEditable={true}
              onAnimationRecorded={(animation) => {
                console.log('Animation recorded:', animation);
                setIsRecording(false);
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Adding Elements</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li>• Tap the buttons to add players, balls, or runners</li>
                <li>• Players are shown as blue circles</li>
                <li>• Balls are shown as white circles</li>
                <li>• Runners are shown as X marks</li>
                <li>• Batters are shown as red circles</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Moving Elements</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li>• Tap and drag any element to move it</li>
                <li>• Drag elements to the trash zone to remove them</li>
                <li>• Use record to capture movements</li>
                <li>• Play back recordings to show plays</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto flex justify-end gap-3 sm:gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg
              hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleSaveImage}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldVisualizerPage;