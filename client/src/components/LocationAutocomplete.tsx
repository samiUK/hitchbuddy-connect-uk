import { useState, useRef, useEffect } from 'react';
import { MapPin, Building, Plane, Train, Bus, ShoppingCart, GraduationCap, Hospital, Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface LocationOption {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const LOCATION_CATEGORIES = {
  CITY_CENTRE: 'City Centre',
  AIRPORT: 'Airport',
  TRAIN_STATION: 'Train Station',
  BUS_STATION: 'Bus Station',
  SHOPPING: 'Shopping Centre',
  UNIVERSITY: 'University',
  HOSPITAL: 'Hospital',
  LANDMARK: 'Landmark',
  BUSINESS_DISTRICT: 'Business District'
};

const PREDEFINED_LOCATIONS: LocationOption[] = [
  // City Centres
  {
    id: 'london-city-centre',
    name: 'London City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Central London, UK'
  },
  {
    id: 'manchester-city-centre',
    name: 'Manchester City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Manchester, UK'
  },
  {
    id: 'birmingham-city-centre',
    name: 'Birmingham City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Birmingham, UK'
  },
  {
    id: 'leeds-city-centre',
    name: 'Leeds City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Leeds, UK'
  },
  
  // Airports
  {
    id: 'heathrow-airport',
    name: 'Heathrow Airport (LHR)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Heathrow Airport, London TW6, UK'
  },
  {
    id: 'gatwick-airport',
    name: 'Gatwick Airport (LGW)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Gatwick Airport, West Sussex RH6, UK'
  },
  {
    id: 'manchester-airport',
    name: 'Manchester Airport (MAN)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Manchester Airport, Manchester M90, UK'
  },
  {
    id: 'birmingham-airport',
    name: 'Birmingham Airport (BHX)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Birmingham Airport, Birmingham B26, UK'
  },
  {
    id: 'stansted-airport',
    name: 'Stansted Airport (STN)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Stansted Airport, Essex CM24, UK'
  },
  {
    id: 'luton-airport',
    name: 'Luton Airport (LTN)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Luton Airport, Bedfordshire LU2, UK'
  },
  
  // Train Stations
  {
    id: 'london-euston',
    name: 'London Euston Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Euston Rd, London NW1, UK'
  },
  {
    id: 'london-kings-cross',
    name: "London King's Cross Station",
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: "King's Cross, London N1, UK"
  },
  {
    id: 'london-paddington',
    name: 'London Paddington Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Paddington, London W2, UK'
  },
  {
    id: 'london-victoria',
    name: 'London Victoria Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Victoria, London SW1V, UK'
  },
  {
    id: 'london-waterloo',
    name: 'London Waterloo Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Waterloo, London SE1, UK'
  },
  {
    id: 'london-liverpool-street',
    name: 'London Liverpool Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Liverpool Street, London EC2M, UK'
  },
  {
    id: 'london-st-pancras',
    name: 'London St Pancras International',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'St Pancras, London N1C, UK'
  },
  {
    id: 'london-london-bridge',
    name: 'London Bridge Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'London Bridge, London SE1, UK'
  },
  {
    id: 'manchester-piccadilly',
    name: 'Manchester Piccadilly Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Piccadilly, Manchester M1, UK'
  },
  {
    id: 'manchester-oxford-road',
    name: 'Manchester Oxford Road Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Oxford Road, Manchester M1, UK'
  },
  {
    id: 'manchester-victoria',
    name: 'Manchester Victoria Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Victoria, Manchester M3, UK'
  },
  {
    id: 'birmingham-new-street',
    name: 'Birmingham New Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'New Street, Birmingham B2, UK'
  },
  {
    id: 'birmingham-snow-hill',
    name: 'Birmingham Snow Hill Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Snow Hill, Birmingham B3, UK'
  },
  {
    id: 'birmingham-moor-street',
    name: 'Birmingham Moor Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Moor Street, Birmingham B5, UK'
  },
  {
    id: 'leeds-station',
    name: 'Leeds Railway Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'New Station St, Leeds LS1, UK'
  },
  {
    id: 'liverpool-lime-street',
    name: 'Liverpool Lime Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Lime Street, Liverpool L1, UK'
  },
  {
    id: 'liverpool-central',
    name: 'Liverpool Central Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Central Station, Liverpool L1, UK'
  },
  {
    id: 'glasgow-central',
    name: 'Glasgow Central Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Gordon Street, Glasgow G1, UK'
  },
  {
    id: 'glasgow-queen-street',
    name: 'Glasgow Queen Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Queen Street, Glasgow G1, UK'
  },
  {
    id: 'edinburgh-waverley',
    name: 'Edinburgh Waverley Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Waverley Bridge, Edinburgh EH1, UK'
  },
  {
    id: 'cardiff-central',
    name: 'Cardiff Central Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Central Square, Cardiff CF10, UK'
  },
  {
    id: 'bristol-temple-meads',
    name: 'Bristol Temple Meads Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Temple Meads, Bristol BS1, UK'
  },
  {
    id: 'newcastle-central',
    name: 'Newcastle Central Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Neville Street, Newcastle NE1, UK'
  },
  {
    id: 'nottingham-station',
    name: 'Nottingham Railway Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Carrington Street, Nottingham NG2, UK'
  },
  {
    id: 'sheffield-station',
    name: 'Sheffield Railway Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Sheaf Street, Sheffield S1, UK'
  },
  
  // Bus Stations
  {
    id: 'london-victoria-coach',
    name: 'Victoria Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: '164 Buckingham Palace Rd, London SW1W, UK'
  },
  {
    id: 'london-golders-green',
    name: 'Golders Green Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Golders Green, London NW11, UK'
  },
  {
    id: 'manchester-coach-station',
    name: 'Manchester Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Chorlton St, Manchester M1, UK'
  },
  {
    id: 'birmingham-coach-station',
    name: 'Birmingham Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Mill Ln, Birmingham B5, UK'
  },
  {
    id: 'birmingham-digbeth',
    name: 'Digbeth Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Digbeth, Birmingham B5, UK'
  },
  {
    id: 'leeds-bus-station',
    name: 'Leeds Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Dyer Street, Leeds LS1, UK'
  },
  {
    id: 'liverpool-one-bus-station',
    name: 'Liverpool ONE Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Canning Place, Liverpool L1, UK'
  },
  {
    id: 'glasgow-buchanan',
    name: 'Buchanan Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Killermont Street, Glasgow G2, UK'
  },
  {
    id: 'edinburgh-bus-station',
    name: 'Edinburgh Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'St Andrew Square, Edinburgh EH2, UK'
  },
  {
    id: 'cardiff-bus-station',
    name: 'Cardiff Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Wood Street, Cardiff CF10, UK'
  },
  {
    id: 'bristol-bus-station',
    name: 'Bristol Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Marlborough Street, Bristol BS1, UK'
  },
  {
    id: 'newcastle-eldon-square',
    name: 'Eldon Square Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Percy Street, Newcastle NE1, UK'
  },
  {
    id: 'nottingham-broadmarsh',
    name: 'Broadmarsh Bus Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Collin Street, Nottingham NG1, UK'
  },
  {
    id: 'sheffield-interchange',
    name: 'Sheffield Interchange',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Pond Street, Sheffield S1, UK'
  },
  
  // Shopping Centres
  {
    id: 'westfield-london',
    name: 'Westfield London',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Ariel Way, London W12, UK'
  },
  {
    id: 'westfield-stratford',
    name: 'Westfield Stratford City',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Montfichet Rd, London E20, UK'
  },
  {
    id: 'trafford-centre',
    name: 'Trafford Centre',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Trafford Centre, Manchester M17, UK'
  },
  {
    id: 'bullring-birmingham',
    name: 'Bullring & Grand Central',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Bullring, Birmingham B5, UK'
  },
  
  // Universities
  {
    id: 'university-college-london',
    name: 'University College London (UCL)',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Gower St, London WC1E, UK'
  },
  {
    id: 'imperial-college-london',
    name: 'Imperial College London',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'South Kensington, London SW7, UK'
  },
  {
    id: 'university-of-manchester',
    name: 'University of Manchester',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Oxford Rd, Manchester M13, UK'
  },
  {
    id: 'university-of-birmingham',
    name: 'University of Birmingham',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Edgbaston, Birmingham B15, UK'
  },
  
  // Business Districts
  {
    id: 'canary-wharf',
    name: 'Canary Wharf',
    category: LOCATION_CATEGORIES.BUSINESS_DISTRICT,
    address: 'Canary Wharf, London E14, UK'
  },
  {
    id: 'city-of-london',
    name: 'City of London',
    category: LOCATION_CATEGORIES.BUSINESS_DISTRICT,
    address: 'City of London, London EC, UK'
  },
  
  // Landmarks
  {
    id: 'tower-bridge',
    name: 'Tower Bridge',
    category: LOCATION_CATEGORIES.LANDMARK,
    address: 'Tower Bridge Rd, London SE1, UK'
  },
  {
    id: 'buckingham-palace',
    name: 'Buckingham Palace',
    category: LOCATION_CATEGORIES.LANDMARK,
    address: 'Westminster, London SW1A, UK'
  }
];

function searchLocations(query: string): LocationOption[] {
  if (!query || query.length < 1) return [];
  
  const searchTerm = query.toLowerCase();
  return PREDEFINED_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchTerm) ||
    location.address.toLowerCase().includes(searchTerm) ||
    location.category.toLowerCase().includes(searchTerm)
  ).slice(0, 20);
}

interface LocationAutocompleteProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case LOCATION_CATEGORIES.AIRPORT:
      return <Plane className="h-4 w-4 text-blue-600" />;
    case LOCATION_CATEGORIES.TRAIN_STATION:
      return <Train className="h-4 w-4 text-green-600" />;
    case LOCATION_CATEGORIES.BUS_STATION:
      return <Bus className="h-4 w-4 text-orange-600" />;
    case LOCATION_CATEGORIES.SHOPPING:
      return <ShoppingCart className="h-4 w-4 text-purple-600" />;
    case LOCATION_CATEGORIES.UNIVERSITY:
      return <GraduationCap className="h-4 w-4 text-indigo-600" />;
    case LOCATION_CATEGORIES.HOSPITAL:
      return <Hospital className="h-4 w-4 text-red-600" />;
    case LOCATION_CATEGORIES.BUSINESS_DISTRICT:
      return <Building className="h-4 w-4 text-gray-600" />;
    case LOCATION_CATEGORIES.LANDMARK:
      return <Landmark className="h-4 w-4 text-yellow-600" />;
    default:
      return <MapPin className="h-4 w-4 text-gray-600" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case LOCATION_CATEGORIES.AIRPORT:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case LOCATION_CATEGORIES.TRAIN_STATION:
      return 'bg-green-100 text-green-800 border-green-200';
    case LOCATION_CATEGORIES.BUS_STATION:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case LOCATION_CATEGORIES.SHOPPING:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case LOCATION_CATEGORIES.UNIVERSITY:
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case LOCATION_CATEGORIES.HOSPITAL:
      return 'bg-red-100 text-red-800 border-red-200';
    case LOCATION_CATEGORIES.BUSINESS_DISTRICT:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case LOCATION_CATEGORIES.LANDMARK:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const LocationAutocomplete = ({ 
  id, 
  name, 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false 
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && value.length > 0) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
      
      const exactMatch = PREDEFINED_LOCATIONS.find(loc => 
        loc.name.toLowerCase() === value.toLowerCase()
      );
      setSelectedLocation(exactMatch || null);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedLocation(null);
    }
  }, [value]);

  const handleSuggestionClick = (location: LocationOption) => {
    onChange(location.name);
    setSelectedLocation(location);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (value && value.length > 0) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      // Show popular locations when focused without input
      const popularLocations = PREDEFINED_LOCATIONS.filter(loc => 
        loc.category === LOCATION_CATEGORIES.CITY_CENTRE ||
        loc.category === LOCATION_CATEGORIES.AIRPORT ||
        loc.category === LOCATION_CATEGORIES.TRAIN_STATION ||
        loc.category === LOCATION_CATEGORIES.BUS_STATION
      ).slice(0, 15);
      setSuggestions(popularLocations);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          required={required}
          autoComplete="off"
          className={selectedLocation ? 'pr-12' : ''}
        />
        {selectedLocation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getCategoryIcon(selectedLocation.category)}
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto mt-1">
          <div className="p-2 border-b bg-gray-50">
            <p className="text-xs text-gray-600 font-medium">
              {value ? 'Matching Locations' : 'Popular Destinations'}
            </p>
          </div>
          {suggestions.map((location) => (
            <div
              key={location.id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionClick(location)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getCategoryIcon(location.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {location.name}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 ${getCategoryColor(location.category)}`}
                    >
                      {location.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {location.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {!value && (
            <div className="p-3 border-t bg-gray-50">
              <p className="text-xs text-gray-500">
                Type to search airports, train stations, shopping centres, and landmarks
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};