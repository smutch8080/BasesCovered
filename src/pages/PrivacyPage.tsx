import React from 'react';
import { Shield } from 'lucide-react';

function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <h2>Introduction</h2>
            <p>
              At Coach Pad, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide to us, including but not limited to:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Profile information</li>
              <li>Payment information</li>
              <li>Communication preferences</li>
            </ul>

            <h3>Usage Information</h3>
            <p>We automatically collect certain information when you use our services, including:</p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the collected information for various purposes, including:</p>
            <ul>
              <li>Providing and maintaining our services</li>
              <li>Processing transactions</li>
              <li>Communicating with you</li>
              <li>Improving our services</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We may share your information with third parties only in the ways described in this policy,
              including:
            </p>
            <ul>
              <li>Service providers and business partners</li>
              <li>Legal requirements and law enforcement</li>
              <li>Protection of rights and safety</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However,
              no method of transmission over the internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>

            <h2>Your Rights</h2>
            <p>You have certain rights regarding your personal information, including:</p>
            <ul>
              <li>Access to your data</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data</li>
              <li>Withdrawal of consent</li>
              <li>Data portability</li>
            </ul>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@coachpad.com">privacy@coachpad.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;