import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Firebase config mirrors src/lib/firebase.ts
const firebaseConfig = {
  projectId: 'mclra-eb016',
  appId: '1:835863133405:web:2266186b0c6da0db8aef34',
  storageBucket: 'mclra-eb016.firebasestorage.app',
  apiKey: 'AIzaSyDx0odY7HpPmml6l4pIVE4sSRq8Jicg2b8',
  authDomain: 'mclra-eb016.firebaseapp.com',
  messagingSenderId: '835863133405',
  measurementId: 'G-4C5JMMTM38',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const names = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Mohammed', 'Sai', 'Krishna', 'Ishaan', 'Anaya', 'Diya', 'Aadhya', 'Myra', 'Anika', 'Sara', 'Zara', 'Riya', 'Aarohi', 'Navya'];
const streets = ['Museum Cross Lane', 'MG Road', 'Church Street', 'Park Avenue', 'Lake View'];
const occupations = ['Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Artist', 'Designer', 'Student', 'Business'];
const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function phone() {
  return `9${randInt(100000000, 999999999)}`;
}

function makeMember() {
  return {
    name: pick(names) + ' ' + String.fromCharCode(65 + randInt(0, 25)),
    relationship: pick(['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Grandparent']),
    phone: Math.random() < 0.7 ? phone() : '',
    occupation: Math.random() < 0.6 ? pick(occupations) : '',
    bloodGroup: pick(bloodGroups),
  };
}

function makeResident(index) {
  const isRented = Math.random() < 0.5;
  const floorType = Math.random() < 0.5 ? 'entire' : (Math.random() < 0.5 ? 'Ground Floor' : 'First Floor');
  const totalMembers = randInt(1, 6);
  const headName = pick(names) + ' ' + ['K', 'M', 'S', 'R', 'T'][randInt(0, 4)];
  const street = pick(streets);
  const houseNumber = String(randInt(1, 250));
  const houseName = `House ${String.fromCharCode(65 + (index % 26))}-${randInt(1, 20)}`;

  const familyMembers = Array.from({ length: Math.max(0, totalMembers - 1) }, () => makeMember());

  return {
    timestamp: serverTimestamp(),
    houseNumber,
    houseName,
    street,
    ownership: isRented ? 'rented' : 'owned',
    permanentAddress: isRented && Math.random() < 0.9 ? `${randInt(101,999)}, ${pick(['Oak', 'Pine', 'Cedar'])} Residency, ${pick(['Bangalore','Chennai','Kochi'])}` : '',
    ownerAddress: isRented && Math.random() < 0.8 ? `${randInt(1,30)} ${pick(['Gandhi Nagar','Indira Nagar','Koramangala'])}` : '',
    floorType,
    totalFamilyMembers: String(totalMembers),
    headOfFamily: {
      name: headName,
      phone: phone(),
      emergencyContact: {
        name: pick(names) + ' ' + ['P','L','N','B'][randInt(0,3)],
        phone: phone(),
      },
      occupation: pick(occupations),
      bloodGroup: pick(bloodGroups),
    },
    familyMembers,
  };
}

async function main() {
  const residentsRef = collection(db, 'residents');
  const count = 20;
  console.log(`Seeding ${count} residents...`);
  for (let i = 0; i < count; i++) {
    const resident = makeResident(i);
    const docRef = await addDoc(residentsRef, resident);
    console.log(`✔ Added ${docRef.id} (${resident.houseName})`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


