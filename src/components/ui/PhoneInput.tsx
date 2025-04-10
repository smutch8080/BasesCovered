import React from 'react';
import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'react-phone-number-input';
import './PhoneInput.css'; // We'll create this file for custom styling

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  error = false,
  required = false,
  className = ""
}) => {
  // This function ensures we're getting a valid E.164 formatted phone number
  const handleChange = (value: string | undefined) => {
    onChange(value || '');
  };

  // Format the phone number for display if needed
  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    
    try {
      // Handle already formatted phone numbers
      if (value.startsWith('+')) {
        return value;
      }
      
      // Default to US for numbers without country code
      return `+1${value.replace(/\D/g, '')}`;
    } catch (e) {
      console.error('Error formatting phone number:', e);
      return value;
    }
  };

  // Validate phone number 
  const isValidPhoneNumber = (value: string) => {
    if (!value) return true; // Empty is considered valid (for required handling separately)
    
    try {
      const phoneNumber = parsePhoneNumber(value);
      return phoneNumber?.isValid() || false;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className={`phone-input-container ${error ? 'has-error' : ''} ${className}`}>
      <PhoneInputLib
        international
        defaultCountry="US"
        value={formatDisplayValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        countryCallingCodeEditable={false}
        className={`custom-phone-input ${error ? 'phone-input-error' : ''}`}
      />
      {error && (
        <p className="error-message">Please enter a valid phone number</p>
      )}
    </div>
  );
};

export default PhoneInput; 