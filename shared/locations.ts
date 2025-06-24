export interface LocationOption {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const LOCATION_CATEGORIES = {
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

export const PREDEFINED_LOCATIONS: LocationOption[] = [
  // City Centres
  {
    id: 'london-city-centre',
    name: 'London City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Central London, UK',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: 'manchester-city-centre',
    name: 'Manchester City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Manchester, UK',
    coordinates: { lat: 53.4808, lng: -2.2426 }
  },
  {
    id: 'birmingham-city-centre',
    name: 'Birmingham City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Birmingham, UK',
    coordinates: { lat: 52.4862, lng: -1.8904 }
  },
  {
    id: 'leeds-city-centre',
    name: 'Leeds City Centre',
    category: LOCATION_CATEGORIES.CITY_CENTRE,
    address: 'Leeds, UK',
    coordinates: { lat: 53.8008, lng: -1.5491 }
  },
  
  // Airports
  {
    id: 'heathrow-airport',
    name: 'Heathrow Airport (LHR)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Heathrow Airport, London TW6, UK',
    coordinates: { lat: 51.4700, lng: -0.4543 }
  },
  {
    id: 'gatwick-airport',
    name: 'Gatwick Airport (LGW)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Gatwick Airport, West Sussex RH6, UK',
    coordinates: { lat: 51.1481, lng: -0.1903 }
  },
  {
    id: 'manchester-airport',
    name: 'Manchester Airport (MAN)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Manchester Airport, Manchester M90, UK',
    coordinates: { lat: 53.3537, lng: -2.2750 }
  },
  {
    id: 'birmingham-airport',
    name: 'Birmingham Airport (BHX)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Birmingham Airport, Birmingham B26, UK',
    coordinates: { lat: 52.4539, lng: -1.7480 }
  },
  {
    id: 'stansted-airport',
    name: 'Stansted Airport (STN)',
    category: LOCATION_CATEGORIES.AIRPORT,
    address: 'Stansted Airport, Essex CM24, UK',
    coordinates: { lat: 51.8860, lng: 0.2389 }
  },
  
  // Train Stations
  {
    id: 'london-euston',
    name: 'London Euston Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Euston Rd, London NW1, UK',
    coordinates: { lat: 51.5282, lng: -0.1337 }
  },
  {
    id: 'london-kings-cross',
    name: "London King's Cross Station",
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: "King's Cross, London N1, UK",
    coordinates: { lat: 51.5308, lng: -0.1238 }
  },
  {
    id: 'london-paddington',
    name: 'London Paddington Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Paddington, London W2, UK',
    coordinates: { lat: 51.5154, lng: -0.1755 }
  },
  {
    id: 'manchester-piccadilly',
    name: 'Manchester Piccadilly Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'Piccadilly, Manchester M1, UK',
    coordinates: { lat: 53.4774, lng: -2.2309 }
  },
  {
    id: 'birmingham-new-street',
    name: 'Birmingham New Street Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'New Street, Birmingham B2, UK',
    coordinates: { lat: 52.4777, lng: -1.8990 }
  },
  {
    id: 'leeds-station',
    name: 'Leeds Railway Station',
    category: LOCATION_CATEGORIES.TRAIN_STATION,
    address: 'New Station St, Leeds LS1, UK',
    coordinates: { lat: 53.7951, lng: -1.5489 }
  },
  
  // Bus Stations
  {
    id: 'london-victoria-coach',
    name: 'Victoria Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: '164 Buckingham Palace Rd, London SW1W, UK',
    coordinates: { lat: 51.4947, lng: -0.1463 }
  },
  {
    id: 'manchester-coach-station',
    name: 'Manchester Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Chorlton St, Manchester M1, UK',
    coordinates: { lat: 53.4767, lng: -2.2364 }
  },
  {
    id: 'birmingham-coach-station',
    name: 'Birmingham Coach Station',
    category: LOCATION_CATEGORIES.BUS_STATION,
    address: 'Mill Ln, Birmingham B5, UK',
    coordinates: { lat: 52.4736, lng: -1.8909 }
  },
  
  // Shopping Centres
  {
    id: 'westfield-london',
    name: 'Westfield London',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Ariel Way, London W12, UK',
    coordinates: { lat: 51.5077, lng: -0.2208 }
  },
  {
    id: 'westfield-stratford',
    name: 'Westfield Stratford City',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Montfichet Rd, London E20, UK',
    coordinates: { lat: 51.5441, lng: -0.0088 }
  },
  {
    id: 'trafford-centre',
    name: 'Trafford Centre',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Trafford Centre, Manchester M17, UK',
    coordinates: { lat: 53.4669, lng: -2.3417 }
  },
  {
    id: 'bullring-birmingham',
    name: 'Bullring & Grand Central',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Bullring, Birmingham B5, UK',
    coordinates: { lat: 52.4777, lng: -1.8943 }
  },
  {
    id: 'bluewater-shopping',
    name: 'Bluewater Shopping Centre',
    category: LOCATION_CATEGORIES.SHOPPING,
    address: 'Greenhithe, Kent DA9, UK',
    coordinates: { lat: 51.4408, lng: 0.2675 }
  },
  
  // Universities
  {
    id: 'university-college-london',
    name: 'University College London (UCL)',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Gower St, London WC1E, UK',
    coordinates: { lat: 51.5246, lng: -0.1340 }
  },
  {
    id: 'imperial-college-london',
    name: 'Imperial College London',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'South Kensington, London SW7, UK',
    coordinates: { lat: 51.4988, lng: -0.1749 }
  },
  {
    id: 'university-of-manchester',
    name: 'University of Manchester',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Oxford Rd, Manchester M13, UK',
    coordinates: { lat: 53.4668, lng: -2.2339 }
  },
  {
    id: 'university-of-birmingham',
    name: 'University of Birmingham',
    category: LOCATION_CATEGORIES.UNIVERSITY,
    address: 'Edgbaston, Birmingham B15, UK',
    coordinates: { lat: 52.4508, lng: -1.9305 }
  },
  
  // Hospitals
  {
    id: 'st-bartholomews-hospital',
    name: "St Bartholomew's Hospital",
    category: LOCATION_CATEGORIES.HOSPITAL,
    address: 'West Smithfield, London EC1A, UK',
    coordinates: { lat: 51.5177, lng: -0.1003 }
  },
  {
    id: 'royal-london-hospital',
    name: 'Royal London Hospital',
    category: LOCATION_CATEGORIES.HOSPITAL,
    address: 'Whitechapel Rd, London E1, UK',
    coordinates: { lat: 51.5189, lng: -0.0594 }
  },
  {
    id: 'manchester-royal-infirmary',
    name: 'Manchester Royal Infirmary',
    category: LOCATION_CATEGORIES.HOSPITAL,
    address: 'Oxford Rd, Manchester M13, UK',
    coordinates: { lat: 53.4603, lng: -2.2306 }
  },
  
  // Business Districts
  {
    id: 'canary-wharf',
    name: 'Canary Wharf',
    category: LOCATION_CATEGORIES.BUSINESS_DISTRICT,
    address: 'Canary Wharf, London E14, UK',
    coordinates: { lat: 51.5054, lng: -0.0235 }
  },
  {
    id: 'city-of-london',
    name: 'City of London',
    category: LOCATION_CATEGORIES.BUSINESS_DISTRICT,
    address: 'City of London, London EC, UK',
    coordinates: { lat: 51.5156, lng: -0.0919 }
  },
  {
    id: 'media-city-manchester',
    name: 'MediaCity UK',
    category: LOCATION_CATEGORIES.BUSINESS_DISTRICT,
    address: 'MediaCity UK, Salford M50, UK',
    coordinates: { lat: 53.4719, lng: -2.2956 }
  },
  
  // Landmarks
  {
    id: 'tower-bridge',
    name: 'Tower Bridge',
    category: LOCATION_CATEGORIES.LANDMARK,
    address: 'Tower Bridge Rd, London SE1, UK',
    coordinates: { lat: 51.5055, lng: -0.0754 }
  },
  {
    id: 'buckingham-palace',
    name: 'Buckingham Palace',
    category: LOCATION_CATEGORIES.LANDMARK,
    address: 'Westminster, London SW1A, UK',
    coordinates: { lat: 51.5014, lng: -0.1419 }
  },
  {
    id: 'big-ben',
    name: 'Big Ben',
    category: LOCATION_CATEGORIES.LANDMARK,
    address: 'Westminster, London SW1A, UK',
    coordinates: { lat: 51.4994, lng: -0.1245 }
  }
];

export function searchLocations(query: string): LocationOption[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return PREDEFINED_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchTerm) ||
    location.address.toLowerCase().includes(searchTerm) ||
    location.category.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
}

export function getLocationsByCategory(category: string): LocationOption[] {
  return PREDEFINED_LOCATIONS.filter(location => location.category === category);
}

export function getAllCategories(): string[] {
  return Object.values(LOCATION_CATEGORIES);
}