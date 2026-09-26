const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/TransporterDashboard.tsx', 'utf-8');

// Replace SEED usage
code = code.replace(/import { SEED_TRANSPORTERS, SEED_BACKHAUL_TRIPS } from '..\/..\/..\/shared\/data\/seedData';/, '');
code = code.replace(/const \[transporter\] = useState<Transporter>\(SEED_TRANSPORTERS\[0\]\);/, 'const [transporter] = useState<Transporter>({ id: "tr-1", name: "Jagdish Yadav", phone: "", vehicleNumber: "MP09AB1234", vehicleType: "Tata Ace", totalCapacityKg: 1000, currentLocation: "Indore", currentRoute: "", availableCapacityKg: 500, rating: 4.8, completedTrips: 120, trustScore: 98 }); // Placeholder for authenticated transporter profile');
code = code.replace(/const \[backhauls, setBackhauls\] = useState<BackhaulTrip\[\]>\(SEED_BACKHAUL_TRIPS\);/, 'const [backhauls, setBackhauls] = useState<BackhaulTrip[]>([]);\n\n  React.useEffect(() => {\n    const fetchTrips = async () => {\n      const trips = await api.getBackhaulTrips();\n      setBackhauls(trips);\n    };\n    fetchTrips();\n  }, []);');

code = code.replace(/const newTrip = {[\s\S]*?};/, 'const newTripData = {\n        origin,\n        destination,\n        availableCapacityKg: availableCapacity,\n        departureTime,\n        vehicleType: transporter.vehicleType,\n      };');

code = code.replace(/setBackhauls\(\[\.\.\.backhauls, newTrip\]\);/, 'const trip = await api.createBackhaulTrip(newTripData);\n      setBackhauls([...backhauls, trip]);');

code = code.replace(/setShowAddTripModal\(false\);/, 'setShowAddTripModal(false);');

fs.writeFileSync('frontend/src/components/TransporterDashboard.tsx', code);
