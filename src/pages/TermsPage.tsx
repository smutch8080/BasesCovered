import React from 'react';
import { FileText } from 'lucide-react';

function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using Coach Pad, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this site.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access and use Coach Pad for personal, non-commercial
              purposes. This is the grant of a license, not a transfer of title, and under this license
              you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>

            <h2>3. Account Terms</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Creating a secure password</li>
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us of any unauthorized use</li>
            </ul>

            <h2>4. User Content</h2>
            <p>
              By posting content on Coach Pad, you grant us a non-exclusive, worldwide, royalty-free
              license to use, modify, publicly perform, publicly display, reproduce, and distribute such
              content.
            </p>

            <h2>5. Payment Terms</h2>
            <p>
              For paid services, you agree to pay all fees and charges associated with your account on
              the terms described in our pricing page. All payments are non-refundable unless otherwise
              specified.
            </p>

            <h2>6. Disclaimer</h2>
            <p>
              Coach Pad is provided "as is" without any warranties, expressed or implied. We do not
              warrant that the service will be uninterrupted or error-free.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              Coach Pad shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without
              prior notice, for conduct that we believe violates these Terms or is harmful to other
              users, us, or third parties, or for any other reason.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United
              States, without regard to its conflict of law provisions.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any
              changes by updating the "Last updated" date of these terms.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at{' '}
              <a href="mailto:terms@coachpad.com">terms@coachpad.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;