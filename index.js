const axios = require('axios');
require('dotenv').config();

// Coordinates for some key railway stations 
const stations = {
  Maradana: { lat: 6.9271, lng: 79.8612 },
  Mirigama: { lat: 7.2427, lng: 80.1270 },
  Anuradhapura: { lat: 8.3450, lng: 80.4170 },
  Vavuniya: { lat: 8.7549, lng: 80.4976 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Badulla: { lat: 6.9843, lng: 81.0550 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Kankesanthurai: { lat: 9.7930, lng: 80.0690 },
  Galle: { lat: 6.0535, lng: 80.2210 },
  Matara: { lat: 5.9485, lng: 80.5364 },
  ColomboFort: { lat: 6.9355, lng: 79.8520 },
  Kurunegala: { lat: 7.4866, lng: 80.3647 },
  Batticaloa: { lat: 7.7339, lng: 81.7082 },
  Trincomalee: { lat: 8.5874, lng: 81.2152 },
};

// Train details
const trains = [
  {
    train_name: "Gampaha Express",
    engine_model: "M8",
    engine_id: "007",
    last_station: "Mirigama",
    start_location: "Maradana",
    destination: "Mirigama",
    speed: 100,
  },
  {
    train_name: "Rajarata Rajini",
    engine_model: "M7",
    engine_id: "008",
    last_station: "Anuradhapura",
    start_location: "ColomboFort",
    destination: "Vavuniya",
    speed: 60,
  },
  {
    train_name: "Udarata Menike",
    engine_model: "M5",
    engine_id: "009",
    last_station: "Kandy",
    start_location: "ColomboFort",
    destination: "Badulla",
    speed: 70,
  },
  {
    train_name: "Yal Devi",
    engine_model: "M6",
    engine_id: "010",
    last_station: "Jaffna",
    start_location: "ColomboFort",
    destination: "Kankesanthurai",
    speed: 50,
  },
  {
    train_name: "Ruhunu Kumari",
    engine_model: "M2",
    engine_id: "011",
    last_station: "Galle",
    start_location: "ColomboFort",
    destination: "Matara",
    speed: 60,
  },
  {
    train_name: "Podi Menike",
    engine_model: "M4",
    engine_id: "012",
    last_station: "Nawalapitiya",
    start_location: "ColomboFort",
    destination: "Badulla",
    speed: 70,
  },
  {
    train_name: "Senkadagala Menike",
    engine_model: "M3",
    engine_id: "013",
    last_station: "Peradeniya",
    start_location: "ColomboFort",
    destination: "Badulla",
    speed: 50,
  },
  {
    train_name: "Meenagaya",
    engine_model: "M9",
    engine_id: "014",
    last_station: "Kantale",
    start_location: "ColomboFort",
    destination: "Batticaloa",
    speed: 60,
  },
  {
    train_name: "Gal Oya",
    engine_model: "M10",
    engine_id: "015",
    last_station: "Gal Oya",
    start_location: "ColomboFort",
    destination: "Trincomalee",
    speed: 70,
  },
  {
    train_name: "Intercity Express",
    engine_model: "M11",
    engine_id: "016",
    last_station: "ColomboFort",
    start_location: "ColomboFort",
    destination: "Kandy",
    speed: 50,
  }
];

// Function to calculate intermediate points
const calculateIntermediatePoint = (start, end, fraction) => {
  const lat1 = start.lat * Math.PI / 180;
  const lng1 = start.lng * Math.PI / 180;
  const lat2 = end.lat * Math.PI / 180;
  const lng2 = end.lng * Math.PI / 180;

  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));

  const A = Math.sin((1 - fraction) * d) / Math.sin(d);
  const B = Math.sin(fraction * d) / Math.sin(d);

  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
  const lng = Math.atan2(y, x);

  return { lat: lat * 180 / Math.PI, lng: lng * 180 / Math.PI };
};

// Send train data to the API
const sendTrainData = async (train, currentPosition) => {
  const trainData = {
    ...train,
    latitude: currentPosition.lat,
    longitude: currentPosition.lng,
    time_stamp: new Date().toISOString()

  };
  
  try {
    const response = await axios.post(process.env.API, trainData, {
      headers: {
        'Authorization': `${process.env.AUTH_TOKEN}` // Replace with your token
      }
    });
    console.log(`Data sent successfully for ${train.train_name}:`);
  } catch (error) {
    console.error(`Error sending data for ${train.train_name}:`, error);
  }
};

// Function to simulate train travel
const simulateTrainTravel = (train) => {
  const start = stations[train.start_location];
  const end = stations[train.destination];
  let fraction = 0; // Start at the beginning of the journey
  const speed = train.speed; // Train speed in km/h
  const intervalTime = 1000; // Time interval for updates in milliseconds
  const totalDistance = 58; // Assume a total distance (replace with actual if known)
  const distancePerInterval = (speed * intervalTime) / 3600000; // Distance covered per interval in km

  const intervalId = setInterval(() => {
    fraction += distancePerInterval / totalDistance;
    if (fraction >= 1) {
      fraction = 1;
      clearInterval(intervalId);
    }

    const currentPosition = calculateIntermediatePoint(start, end, fraction);
    sendTrainData(train, currentPosition);
  }, intervalTime);

  // Send initial data immediately
  sendTrainData(train, start);
};

// Start simulation for all trains
trains.forEach(train => simulateTrainTravel(train));
