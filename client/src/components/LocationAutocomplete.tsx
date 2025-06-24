
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface LocationAutocompleteProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

// Common UK locations for suggestions
const commonLocations = [
  "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", 
  "Bristol", "Newcastle", "Nottingham", "Cardiff", "Edinburgh", "Glasgow",
  "Belfast", "Brighton", "Cambridge", "Oxford", "Bath", "York", "Chester",
  "Canterbury", "Coventry", "Leicester", "Southampton", "Portsmouth",
  "Plymouth", "Exeter", "Norwich", "Ipswich", "Colchester", "Chelmsford",
  "Reading", "Slough", "Windsor", "Guildford", "Croydon", "Kingston upon Thames",
  "Richmond", "Wimbledon", "Greenwich", "Blackpool", "Preston", "Blackburn",
  "Burnley", "Lancaster", "Carlisle", "Kendal", "Penrith", "Workington",
  "Barrow-in-Furness", "Oldham", "Rochdale", "Bolton", "Wigan", "Stockport",
  "Sale", "Altrincham", "Warrington", "Chester", "Crewe", "Macclesfield",
  "Stoke-on-Trent", "Derby", "Chesterfield", "Mansfield", "Lincoln",
  "Grimsby", "Scunthorpe", "Hull", "Doncaster", "Rotherham", "Barnsley",
  "Wakefield", "Huddersfield", "Halifax", "Bradford", "Keighley", "Skipton",
  "Harrogate", "Ripon", "Thirsk", "Northallerton", "Darlington", "Durham",
  "Sunderland", "Middlesbrough", "Stockton-on-Tees", "Hartlepool"
];

export const LocationAutocomplete = ({ 
  id, 
  name, 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false 
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 1) {
      const filteredSuggestions = commonLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0 && value !== filteredSuggestions[0]);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestionIndex(-1);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }, 150);
  };

  return (
    <div className="relative space-y-2">
      <Label htmlFor={id} className="flex items-center space-x-1">
        <MapPin className="h-4 w-4" />
        <span>{label}</span>
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => value.length >= 1 && setSuggestions(prev => prev.length > 0 ? (setShowSuggestions(true), prev) : prev)}
          required={required}
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                  index === activeSuggestionIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-3 w-3 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
