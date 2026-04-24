/**
 * seeder.js – Populate database with realistic demo data
 * Run: node seeder.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSpace = require('./models/ParkingSpace');
const Booking = require('./models/Booking');

dotenv.config();

// ─── Users ──────────────────────────────────────────────────────────────────
const users = [
  {
    name: 'Admin User',
    email: 'admin@parky.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Rahul Sharma',
    email: 'host@parky.com',
    password: 'password123',
    role: 'host',
    phone: '9876543210',
    isVerified: true,
    hostApproved: true,
  },
  {
    name: 'Sneha Kapoor',
    email: 'customer@parky.com',
    password: 'password123',
    role: 'customer',
    phone: '9123456789',
    isVerified: true,
  },
];

// ─── Parking Spaces (15 rich entries across Indian cities) ───────────────────
// vehicleTypes: 'car' | 'bike' | 'both'
// coordinates: [longitude, latitude]  ← GeoJSON order
const ALL_TIME_SLOTS = [
  { day: 'Mon', open: '06:00', close: '22:00' },
  { day: 'Tue', open: '06:00', close: '22:00' },
  { day: 'Wed', open: '06:00', close: '22:00' },
  { day: 'Thu', open: '06:00', close: '22:00' },
  { day: 'Fri', open: '06:00', close: '23:00' },
  { day: 'Sat', open: '07:00', close: '23:00' },
  { day: 'Sun', open: '08:00', close: '20:00' },
];

const WEEKDAY_SLOTS = [
  { day: 'Mon', open: '08:00', close: '20:00' },
  { day: 'Tue', open: '08:00', close: '20:00' },
  { day: 'Wed', open: '08:00', close: '20:00' },
  { day: 'Thu', open: '08:00', close: '20:00' },
  { day: 'Fri', open: '08:00', close: '20:00' },
];

const spaces = [
  // ── ADYAR, CHENNAI (within 1-4 km of Adyar signal) ──────────────────────
  {
    title: 'Adyar Bridge Covered Parking',
    address: 'Adyar Bridge Road, Gandhi Nagar, Adyar, Chennai 600020',
    description: 'Covered parking right next to Adyar Bridge. Secure barrier entry, 24/7 CCTV, and attendant on duty 6am-10pm. Ideal for office-goers and shoppers in Adyar.',
    pricePerHour: 30,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 12, availableSlots: 7, isEVCharging: true, isSecurityGuard: true,
    images: ['/uploads/park1.jpg'],
    location: { type: 'Point', coordinates: [80.2574, 13.0012] },
    status: 'approved', totalBookings: 88, averageRating: 4.5, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Gandhi Nagar Bike Stand',
    address: '3rd Cross Street, Gandhi Nagar, Adyar, Chennai 600020',
    description: 'Dedicated two-wheeler parking in the heart of Gandhi Nagar. Numbered slots, CCTV, and secure racks. Walk to Adyar market in 2 minutes.',
    pricePerHour: 10,
    vehicleTypes: ['bike'],
    totalSlots: 30, availableSlots: 18,
    images: ['/uploads/park2.jpg'],
    location: { type: 'Point', coordinates: [80.2548, 13.0050] },
    status: 'approved', totalBookings: 320, averageRating: 4.3, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Besant Nagar Beach Parking',
    address: 'Beach Road, Besant Nagar, Chennai 600090',
    description: 'Spacious open lot near Besant Nagar beach. Cars and bikes welcome. Best for evening visitors and weekend outings.',
    pricePerHour: 25,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 20, availableSlots: 12, isSecurityGuard: true,
    images: ['/uploads/park3.jpg'],
    location: { type: 'Point', coordinates: [80.2707, 12.9987] },
    status: 'approved', totalBookings: 210, averageRating: 4.6, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Kasturba Nagar Private Garage',
    address: '5th Main Road, Kasturba Nagar, Adyar, Chennai 600020',
    description: 'Private covered garage in a quiet residential colony. Remote-lock shutter, CCTV. Cars only. Great for overnight secure parking.',
    pricePerHour: 35,
    vehicleTypes: ['car'],
    totalSlots: 2, availableSlots: 2,
    images: ['/uploads/park4.png'],
    location: { type: 'Point', coordinates: [80.2490, 12.9950] },
    status: 'approved', totalBookings: 30, averageRating: 5.0, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Kotturpuram Multi-Vehicle Parking',
    address: 'Lattice Bridge Road, Kotturpuram, Chennai 600085',
    description: 'Large parking complex near Kotturpuram flyover. Separate lanes for cars and bikes, automated boom barrier, wash bay, monthly pass available.',
    pricePerHour: 40,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 35, availableSlots: 20, isEVCharging: true,
    images: ['/uploads/park1.jpg'],
    location: { type: 'Point', coordinates: [80.2489, 13.0151] },
    status: 'approved', totalBookings: 150, averageRating: 4.4, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Thiruvanmiyur IT Parking',
    address: 'Rajiv Gandhi Salai (OMR), Thiruvanmiyur, Chennai 600041',
    description: 'Premium parking next to the Thiruvanmiyur IT corridor. Shaded bays, EV charging, 24/7 security. Ideal for software professionals.',
    pricePerHour: 45,
    vehicleTypes: ['car'],
    totalSlots: 25, availableSlots: 10,
    images: ['/uploads/park2.jpg'],
    location: { type: 'Point', coordinates: [80.2610, 12.9831] },
    status: 'approved', totalBookings: 95, averageRating: 4.7, timeSlots: WEEKDAY_SLOTS,
  },
  {
    title: 'Taramani Two-Wheeler Hub',
    address: 'CSIR Road, Taramani, Chennai 600113',
    description: 'High-capacity two-wheeler hub near CSIR campus. Numbered slots, CCTV, attendant. Perfect for researchers and IT commuters.',
    pricePerHour: 12,
    vehicleTypes: ['bike'],
    totalSlots: 50, availableSlots: 28,
    images: ['/uploads/park3.jpg'],
    location: { type: 'Point', coordinates: [80.2444, 12.9900] },
    status: 'approved', totalBookings: 430, averageRating: 4.2, timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Adyar Signal Corner Parking',
    address: 'Sardar Patel Road, Adyar Signal, Chennai 600020',
    description: 'Located at the busy Adyar signal junction. Easy access, attendant, CCTV, adjacent to major bus stops and auto stands.',
    pricePerHour: 20,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 15, availableSlots: 6,
    images: ['/uploads/park4.png'],
    location: { type: 'Point', coordinates: [80.2560, 13.0020] },
    status: 'approved', totalBookings: 175, averageRating: 4.1, timeSlots: ALL_TIME_SLOTS,
  },

  // ── BANGALORE ────────────────────────────────────────────────────────────
  {
    title: 'Premium Basement Parking – HSR Layout',
    address: 'Sector 2, HSR Layout, Bangalore 560102',
    description:
      'Secure underground basement with 24/7 CCTV surveillance, professional security guard, EV charging points, and covered protection from rain. Ideal for daily office-goers and long-term parking.',
    pricePerHour: 40,
    vehicleTypes: ['car'],
    totalSlots: 8,
    availableSlots: 5,
    images: [
      '/uploads/park1.jpg',
    ],
    location: { type: 'Point', coordinates: [77.6411, 12.9128] },
    status: 'approved',
    totalBookings: 42,
    averageRating: 4.7,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Shaded Driveway – Indiranagar',
    address: '100ft Road, Indiranagar, Bangalore 560038',
    description:
      'Spacious gated driveway in a calm residential street. Overhead polycarbonate shade keeps your vehicle cool. Ideal for both cars and bikes. Highly rated by regular users.',
    pricePerHour: 30,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 4,
    availableSlots: 2,
    images: [
      '/uploads/park2.jpg',
    ],
    location: { type: 'Point', coordinates: [77.6408, 12.9716] },
    status: 'approved',
    totalBookings: 118,
    averageRating: 4.8,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'City Centre Bike Parking – MG Road',
    address: 'MG Road near Trinity Metro, Bangalore 560001',
    description:
      'Dedicated two-wheeler parking right at MG Road metro station exit. Perfect for commuters. Secure bollards, number plate verification, and bike covers available on request.',
    pricePerHour: 15,
    vehicleTypes: ['bike'],
    totalSlots: 20,
    availableSlots: 12, isSecurityGuard: true,
    images: [
      '/uploads/park3.jpg',
    ],
    location: { type: 'Point', coordinates: [77.6033, 12.9767] },
    status: 'approved',
    totalBookings: 230,
    averageRating: 4.4,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Open Lot – Koramangala Forum Mall',
    address: 'Forum Mall Road, Koramangala, Bangalore 560095',
    description:
      'Spacious open parking lot next to Forum Mall. Both cars and bikes welcome. Direct entry from the service road, attendant on duty from 9am to 10pm.',
    pricePerHour: 50,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 25,
    availableSlots: 10,
    images: [
      '/uploads/park4.png',
    ],
    location: { type: 'Point', coordinates: [77.6101, 12.9352] },
    status: 'approved',
    totalBookings: 89,
    averageRating: 4.2,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Private Covered Garage – Whitefield',
    address: 'ITPL Road, Whitefield, Bangalore 560066',
    description:
      'Single private garage in a tech-park zone. Fully enclosed, remote-lock door, CCTV. Great for IT professionals working in Whitefield. Monthly plan available at the counter.',
    pricePerHour: 35,
    vehicleTypes: ['car'],
    totalSlots: 1,
    availableSlots: 1,
    images: [
      '/uploads/park1.jpg',
    ],
    location: { type: 'Point', coordinates: [77.7500, 12.9698] },
    status: 'approved',
    totalBookings: 15,
    averageRating: 5.0,
    timeSlots: WEEKDAY_SLOTS,
  },

  // ── CHENNAI ───────────────────────────────────────────────────────────────
  {
    title: 'Anna Nagar Multi-Level Parking',
    address: '2nd Avenue, Anna Nagar, Chennai 600040',
    description:
      'Modern multi-storey parking facility in the heart of Anna Nagar. 3 levels, elevator access, 24/7 operation, vehicle wash service available on ground floor.',
    pricePerHour: 45,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 60,
    availableSlots: 35,
    images: [
      '/uploads/park2.jpg',
    ],
    location: { type: 'Point', coordinates: [80.2101, 13.0850] },
    status: 'approved',
    totalBookings: 310,
    averageRating: 4.6,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Nungambakkam Bike Stand',
    address: 'Nungambakkam High Road, Chennai 600034',
    description:
      'Secure two-wheeler stand near Nungambakkam railway station. CCTV, numbered slots, and a helpful attendant. Best for office commuters.',
    pricePerHour: 10,
    vehicleTypes: ['bike'],
    totalSlots: 40,
    availableSlots: 20, isEVCharging: true,
    images: [
      '/uploads/park3.jpg',
    ],
    location: { type: 'Point', coordinates: [80.2507, 13.0604] },
    status: 'approved',
    totalBookings: 500,
    averageRating: 4.3,
    timeSlots: ALL_TIME_SLOTS,
  },

  // ── MUMBAI ────────────────────────────────────────────────────────────────
  {
    title: 'Bandra West Covered Parking',
    address: 'Hill Road, Bandra West, Mumbai 400050',
    description:
      'Premium covered parking in upmarket Bandra West. 24/7 security, valet service available on weekends, and reserved spots for electric vehicles.',
    pricePerHour: 80,
    vehicleTypes: ['car'],
    totalSlots: 12,
    availableSlots: 4,
    images: [
      '/uploads/park4.png',
    ],
    location: { type: 'Point', coordinates: [72.8311, 19.0596] },
    status: 'approved',
    totalBookings: 67,
    averageRating: 4.9,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Powai Lake View Parking',
    address: 'Hiranandani Gardens, Powai, Mumbai 400076',
    description:
      'Open parking near the serene Powai lake inside Hiranandani. Suitable for cars and bikes. Attendant available 6am–10pm. Scenic and safe neighbourhood.',
    pricePerHour: 40,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 18,
    availableSlots: 9,
    images: [
      '/uploads/park1.jpg',
    ],
    location: { type: 'Point', coordinates: [72.9054, 19.1197] },
    status: 'approved',
    totalBookings: 55,
    averageRating: 4.5,
    timeSlots: ALL_TIME_SLOTS,
  },

  // ── HYDERABAD ─────────────────────────────────────────────────────────────
  {
    title: 'HITEC City Tech Park Parking',
    address: 'Cyber Towers, HITEC City, Hyderabad 500081',
    description:
      'Corporate-grade parking right inside HITEC City tech corridor. Dedicated lanes for cars and bikes, automated entry barrier, CCTV, and fire safety certified.',
    pricePerHour: 35,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 50,
    availableSlots: 30,
    images: [
      '/uploads/park2.jpg',
    ],
    location: { type: 'Point', coordinates: [78.3718, 17.4501] },
    status: 'approved',
    totalBookings: 280,
    averageRating: 4.6,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Banjara Hills Residential Spot',
    address: 'Road No. 12, Banjara Hills, Hyderabad 500034',
    description:
      'Private residential parking spot in premium Banjara Hills. Fully gated, number-plate registered entry, zero-tolerance towing policy. Cars only.',
    pricePerHour: 55,
    vehicleTypes: ['car'],
    totalSlots: 3,
    availableSlots: 1,
    images: [
      '/uploads/park3.jpg',
    ],
    location: { type: 'Point', coordinates: [78.4483, 17.4126] },
    status: 'approved',
    totalBookings: 22,
    averageRating: 4.8,
    timeSlots: ALL_TIME_SLOTS,
  },

  // ── DELHI ─────────────────────────────────────────────────────────────────
  {
    title: 'Connaught Place Underground',
    address: 'Block A, Connaught Place, New Delhi 110001',
    description:
      'Iconic underground parking beneath the Connaught Place outer circle. Clean, well-lit, 4 levels, 24/7 attendants, and easy exit to all radial roads. Ideal for shoppers.',
    pricePerHour: 60,
    vehicleTypes: ['car'],
    totalSlots: 100,
    availableSlots: 40,
    images: [
      '/uploads/park4.png',
    ],
    location: { type: 'Point', coordinates: [77.2195, 28.6315] },
    status: 'approved',
    totalBookings: 780,
    averageRating: 4.4,
    timeSlots: ALL_TIME_SLOTS,
  },
  {
    title: 'Lajpat Nagar Two-Wheeler Hub',
    address: 'Central Market, Lajpat Nagar, New Delhi 110024',
    description:
      'High-capacity two-wheeler parking right outside Lajpat Nagar market. Secure racks, numbered bays, CCTV. Perfect for shoppers and market vendors.',
    pricePerHour: 12,
    vehicleTypes: ['bike'],
    totalSlots: 80,
    availableSlots: 45,
    images: [
      '/uploads/park1.jpg',
    ],
    location: { type: 'Point', coordinates: [77.2388, 28.5665] },
    status: 'approved',
    totalBookings: 1100,
    averageRating: 4.2,
    timeSlots: ALL_TIME_SLOTS,
  },

  // ── PUNE ──────────────────────────────────────────────────────────────────
  {
    title: 'Koregaon Park Garden Parking',
    address: 'North Main Road, Koregaon Park, Pune 411001',
    description:
      'Shaded garden-side parking in the posh Koregaon Park neighbourhood. Both cars and bikes welcome. Near popular cafes and restaurants. Attendant on duty all day.',
    pricePerHour: 25,
    vehicleTypes: ['car', 'bike', 'both'],
    totalSlots: 15,
    availableSlots: 8,
    images: [
      '/uploads/park2.jpg',
    ],
    location: { type: 'Point', coordinates: [73.8938, 18.5362] },
    status: 'approved',
    totalBookings: 145,
    averageRating: 4.7,
    timeSlots: ALL_TIME_SLOTS,
  },
];

// ─── Import logic ────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✔ MongoDB connected');

    await User.deleteMany();
    await ParkingSpace.deleteMany();
    await Booking.deleteMany();
    console.log('✔ Old data cleared');

    const createdUsers = await User.create(users);
    const hostId = createdUsers[1]._id;
    const customerId = createdUsers[2]._id;
    console.log('✔ Users created');

    const spacesWithHost = spaces.map(s => ({ ...s, host: hostId }));
    const createdSpaces = await ParkingSpace.create(spacesWithHost);
    console.log(`✔ ${createdSpaces.length} parking spaces created`);

    // ── Sample bookings (covers all statuses) ──────────────────────────────
    const now = new Date();
    const h = (n) => new Date(now.getTime() + n * 3600000);
    const d = (n) => new Date(now.getTime() + n * 86400000);

    const dummyBookings = [
      // completed bookings (show revenue on host dashboard)
      { customer: customerId, parkingSpace: createdSpaces[0]._id, host: hostId, startTime: d(-3), endTime: new Date(d(-3).getTime() + 2 * 3600000), totalHours: 2, totalAmount: 80, vehicleType: 'car', vehicleNumber: 'KA 01 AB 1234', status: 'completed' },
      { customer: customerId, parkingSpace: createdSpaces[1]._id, host: hostId, startTime: d(-2), endTime: new Date(d(-2).getTime() + 3 * 3600000), totalHours: 3, totalAmount: 90, vehicleType: 'bike', vehicleNumber: 'KA 05 XY 9876', status: 'completed' },
      { customer: customerId, parkingSpace: createdSpaces[5]._id, host: hostId, startTime: d(-5), endTime: new Date(d(-5).getTime() + 4 * 3600000), totalHours: 4, totalAmount: 180, vehicleType: 'car', vehicleNumber: 'TN 09 CD 5678', status: 'completed' },
      { customer: customerId, parkingSpace: createdSpaces[7]._id, host: hostId, startTime: d(-7), endTime: new Date(d(-7).getTime() + 2 * 3600000), totalHours: 2, totalAmount: 160, vehicleType: 'car', vehicleNumber: 'MH 02 EF 3344', status: 'completed' },

      // confirmed bookings
      { customer: customerId, parkingSpace: createdSpaces[2]._id, host: hostId, startTime: h(2), endTime: h(5), totalHours: 3, totalAmount: 45, vehicleType: 'bike', vehicleNumber: 'KA 03 MN 4567', status: 'confirmed' },
      { customer: customerId, parkingSpace: createdSpaces[9]._id, host: hostId, startTime: h(1), endTime: h(4), totalHours: 3, totalAmount: 105, vehicleType: 'car', vehicleNumber: 'TS 08 GH 7890', status: 'confirmed' },

      // pending bookings
      { customer: customerId, parkingSpace: createdSpaces[3]._id, host: hostId, startTime: d(1), endTime: new Date(d(1).getTime() + 2 * 3600000), totalHours: 2, totalAmount: 100, vehicleType: 'car', vehicleNumber: 'KA 07 PQ 1122', status: 'pending' },
      { customer: customerId, parkingSpace: createdSpaces[11]._id, host: hostId, startTime: d(2), endTime: new Date(d(2).getTime() + 3 * 3600000), totalHours: 3, totalAmount: 180, vehicleType: 'car', vehicleNumber: 'DL 01 RS 3344', status: 'pending' },

      // cancelled booking
      { customer: customerId, parkingSpace: createdSpaces[4]._id, host: hostId, startTime: d(-1), endTime: new Date(d(-1).getTime() + 2 * 3600000), totalHours: 2, totalAmount: 70, vehicleType: 'car', vehicleNumber: 'KA 09 UV 5566', status: 'cancelled' },
    ];

    await Booking.create(dummyBookings);

    // Update host earnings
    const totalEarnings = dummyBookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + b.totalAmount, 0);
    await User.findByIdAndUpdate(hostId, { totalEarnings });

    console.log('✔ Sample bookings created');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅  Data imported successfully!\n');
    console.log('  Demo credentials:');
    console.log('    Admin    → admin@parky.com    / admin123');
    console.log('    Host     → host@parky.com     / password123');
    console.log('    Customer → customer@parky.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
