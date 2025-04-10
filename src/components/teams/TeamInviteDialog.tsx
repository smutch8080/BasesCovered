import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { QrCode, Copy, Download, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  inviteHash?: string;
}

export const TeamInviteDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  inviteHash: existingHash
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteHash, setInviteHash] = useState(existingHash || '');
  const [qrCode, setQrCode] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${teamId}/${inviteHash}`;
  };

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
      const newHash = nanoid(10); // Generate a 10-character unique hash
      
      // Update team document with new invite hash
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        inviteHash: newHash,
        updatedAt: new Date()
      });

      setInviteHash(newHash);
      toast.success('New invite link generated');
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('Failed to generate invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      setIsLoading(true);
      const inviteLink = generateInviteLink();
      const qrDataUrl = await QRCode.toDataURL(inviteLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrDataUrl);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${teamName.toLowerCase().replace(/\s+/g, '-')}-invite-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Create Your Team Invitation
          </Dialog.Title>

          <p className="text-gray-600 mb-6">
            Invite players and parents with ease! Generate a single link and matching QR code so anyone can join your team in seconds. Share the link via email, text, or social media—or display the QR code at your next event for instant sign-ups.
          </p>

          <div className="space-y-6">
            {/* Link Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-medium text-gray-800">Invite Link</h3>
                </div>
                <button
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg
                    hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              {inviteHash ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generateInviteLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"
                    title="Copy link"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Link
                </button>
              )}
            </div>

            {/* QR Code Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-medium text-gray-800">QR Code</h3>
                </div>
              </div>

              {showQR && qrCode ? (
                <div className="text-center">
                  <img
                    src={qrCode}
                    alt="Team Invite QR Code"
                    className="mx-auto mb-4 rounded-lg shadow-md"
                  />
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateQR}
                  disabled={isLoading || !inviteHash}
                  className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate QR Code
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};