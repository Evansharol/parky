/**
 * seeder.js – Populate database with demo data
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSpace = require('./models/ParkingSpace');
const Booking = require('./models/Booking');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@parky.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'Rahul Host',
    email: 'host@parky.com',
    password: 'password123',
    role: 'host',
    phone: '9876543210',
    isVerified: true,
    hostApproved: true
  },
  {
    name: 'Sneha Customer',
    email: 'customer@parky.com',
    password: 'password123',
    role: 'customer',
    phone: '9123456789',
    isVerified: true
  }
];

const spaces = [
  {
    title: 'Secure Car Parking - Koramangala 4th Block',
    description: 'Safe and spacious driveway parking with 24/7 CCTV. Ideal for sedans and SUVs.',
    address: '123, 80 Feet Rd, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    location: { type: 'Point', coordinates: [77.6244, 12.9344] },
    pricePerHour: 40,
    vehicleTypes: ['car'],
    totalSlots: 2,
    availableSlots: 2,
    status: 'approved',
    totalBookings: 15,
    averageRating: 4.8
  },
  {
    title: 'Budget Bike Spot near Indiranagar Metro',
    description: 'Fast access to metro. Gated community parking.',
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    location: { type: 'Point', coordinates: [77.6412, 12.9784] },
    pricePerHour: 15,
    vehicleTypes: ['bike'],
    totalSlots: 5,
    availableSlots: 5,
    status: 'approved',
    totalBookings: 42,
    averageRating: 4.5
  },
  {
    title: 'Prime Parking at Brigade Road',
    description: 'Premium spot in the heart of the city. High security.',
    address: 'Brigade Rd, Ashok Nagar, Bengaluru, Karnataka 560025',
    location: { type: 'Point', coordinates: [77.6066, 12.9738] },
    pricePerHour: 80,
    vehicleTypes: ['car', 'bike'],
    totalSlots: 1,
    availableSlots: 1,
    status: 'approved',
    totalBookings: 8,
    averageRating: 4.9
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await User.deleteMany();
    await ParkingSpace.deleteMany();
    await Booking.deleteMany();

    const createdUsers = await User.create(users);
    const hostId = createdUsers[1]._id;

    const spacesWithHost = spaces.map(s => ({ ...s, host: hostId }));
    const createdSpaces = await ParkingSpace.create(spacesWithHost);

    // Add some dummy bookings for the earnings page
    const customerId = createdUsers[2]._id;
    const dummyBookings = [
      {
        customer: customerId,
        parkingSpace: createdSpaces[0]._id,
        host: hostId,
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        totalHours: 2,
        totalAmount: 80,
        vehicleType: 'car',
        vehicleNumber: 'KA 01 AB 1234',
        status: 'completed'
      },
      {
        customer: customerId,
        parkingSpace: createdSpaces[1]._id,
        host: hostId,
        startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
        endTime: new Date(new Date().setDate(new Date().getDate() - 1) + 3 * 60 * 60 * 1000),
        totalHours: 3,
        totalAmount: 45,
        vehicleType: 'bike',
        vehicleNumber: 'KA 05 XY 9876',
        status: 'completed'
      },
      {
        customer: customerId,
        parkingSpace: createdSpaces[2]._id,
        host: hostId,
        startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 26 * 60 * 60 * 1000),
        totalHours: 2,
        totalAmount: 160,
        vehicleType: 'car',
        vehicleNumber: 'KA 03 MN 4567',
        status: 'confirmed'
      }
    ];
    await Booking.create(dummyBookings);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
