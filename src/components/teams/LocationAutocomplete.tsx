import React, { useState, useEffect } from 'react';
import { Location } from '../../types/team';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { searchPlaces } from '../../lib/places';
import toast from 'react-hot-toast';

interface Props {
  value: Location | undefined;
  onChange: (location: Location) => void;
  className?: string;
  placeholder?: string;
}

const defaultLocation: Location = {
  city: '',
  state: '',
  country: 'USA',
  placeId: ''
};

export const LocationAutocomplete: React.FC<Props> = ({ 
  value = defaultLocation, 
  onChange, 
  className = '',
  placeholder = 'Enter city name'
}) => {
  const [inputValue, setInputValue] = useState(value?.city || '');
  const [debouncedValue] = useDebounce(inputValue, 300);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value?.city || '');
  }, [value?.city]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedValue || debouncedValue.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const places = await searchPlaces(debouncedValue);
        setSuggestions(places);
      } catch (error) {
        console.error('Error searching places:', error);
        setError('Unable to load location suggestions');
        // Provide fallback suggestions
        setSuggestions([
          { city: 'New York', state: 'NY', country: 'USA', placeId: 'ny' },
          { city: 'Los Angeles', state: 'CA', country: 'USA', placeId: 'la' },
          { city: 'Chicago', state: 'IL', country: 'USA', placeId: 'chi' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  const handleSelectSuggestion = (suggestion: Location) => {
    onChange({
      ...suggestion,
      address: suggestion.city + ', ' + suggestion.state
    });
    setInputValue(suggestion.city + ', ' + suggestion.state);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
            setError(null);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder={placeholder}
        />
      </div>

      {showSuggestions && (debouncedValue.length >= 2 || error) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-gray-500">Using fallback suggestions:</p>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.placeId}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion.city}</div>
                  <div className="text-sm text-gray-500">
                    {suggestion.state}, {suggestion.country}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No suggestions found</div>
          )}
        </div>
      )}
    </div>
  );
};