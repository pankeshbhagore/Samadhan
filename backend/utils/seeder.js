require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const { Counter } = require('../models/Counter');
const statesData = require('./statesData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/samadhan';

const departmentsTemplate = [
  { name: 'Roads & Infrastructure', code: 'ROADS', complaintCategories: ['roads_potholes', 'drainage'], slaHours: 48 },
  { name: 'Water Supply Board', code: 'WATER', complaintCategories: ['water_supply', 'sewage'], slaHours: 24 },
  { name: 'Sanitation & Waste', code: 'SANIT', complaintCategories: ['garbage_sanitation'], slaHours: 24 },
  { name: 'Electricity Department', code: 'ELEC', complaintCategories: ['electricity', 'street_lights'], slaHours: 12 },
  { name: 'Traffic Management', code: 'TRAFFIC', complaintCategories: ['traffic'], slaHours: 48 },
  { name: 'Environment & Pollution', code: 'ENV', complaintCategories: ['pollution', 'noise_complaint'], slaHours: 72 },
  { name: 'Parks & Recreation', code: 'PARKS', complaintCategories: ['park_maintenance'], slaHours: 96 },
  { name: 'Building & Construction', code: 'BUILD', complaintCategories: ['building_safety', 'encroachment'], slaHours: 24 },
];

const complaintTemplates = [
  { title: 'Large pothole on main road causing accidents', description: 'There is a massive pothole causing multiple accidents daily. Urgent repair needed.', category: 'roads_potholes', priority: 'high' },
  { title: 'Water supply disrupted for 3 days', description: 'No water supply for the past 3 days. Families are suffering especially during summer.', category: 'water_supply', priority: 'high' },
  { title: 'Garbage not collected for 2 weeks', description: 'Garbage has not been collected in our area for 2 weeks. Rotting waste is creating health hazard and foul smell.', category: 'garbage_sanitation', priority: 'medium' },
  { title: 'CRITICAL: Sewage overflow near school causing health risk', description: 'Sewage is overflowing near Government Primary School. Children are being exposed to raw sewage. EMERGENCY.', category: 'sewage', priority: 'critical', isCritical: true, criticalReason: 'sewage overflow school' },
  { title: 'Street lights not working in entire sector', description: 'All street lights are non-functional for a month. Area becomes pitch dark after sunset, creating safety issues.', category: 'street_lights', priority: 'high' },
  { title: 'Illegal construction blocking public road', description: 'Builder is constructing illegally on public land, blocking the road completely.', category: 'encroachment', priority: 'medium' },
  { title: 'Industrial smoke causing severe pollution', description: 'A factory is releasing black smoke 24x7 causing severe air pollution in residential areas nearby.', category: 'pollution', priority: 'high' },
  { title: 'CRITICAL: Building showing structural cracks may collapse', description: 'Residential building showing large cracks in walls and pillars. Residents fear collapse. Immediate inspection needed.', category: 'building_safety', priority: 'critical', isCritical: true, criticalReason: 'building collapse' },
  { title: 'Park benches broken, playing area unsafe for children', description: 'All benches and play equipment are broken and rusted, unsafe for children.', category: 'park_maintenance', priority: 'low' },
  { title: 'Traffic signal malfunctioning causing daily jams', description: 'Signal is stuck on red for 10+ minutes causing massive traffic jams during peak hours.', category: 'traffic', priority: 'high' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB...');

  await Promise.all([User.deleteMany(), Department.deleteMany(), Complaint.deleteMany(), Counter.deleteMany()]);
  console.log('Cleared existing data...');

  const password = await bcrypt.hash('password123', 12);
  const statuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'pending_verification', 'resolved'];

  // 1 Global Super Admin
  await User.create({ name: 'Super Admin', email: 'admin@samadhan.gov.in', password, role: 'super_admin', designation: 'All India Administrator', isActive: true, state: null });
  console.log('Created Super Admin.');

  for (const stateObj of statesData) {
    const sc = stateObj.code.toLowerCase();
    
    // Create Departments for this state
    const depts = departmentsTemplate.map((d, i) => ({
      ...d,
      state: stateObj.code,
      mcd311DeptId: `DEPT-${sc}-${i+1}`,
      contactEmail: `${d.code.toLowerCase()}@${sc}.samadhan.gov.in`,
      contactPhone: `1800-${Math.floor(100000 + Math.random() * 900000)}`
    }));
    const createdDepts = await Department.insertMany(depts);

    // Create State Users
    const usersRaw = [
      { name: `${stateObj.name} CM`, email: `cm@${sc}.samadhan.gov.in`, password, role: 'cm', designation: `Chief Minister of ${stateObj.name}`, state: stateObj.code, isActive: true },
      { name: `Head Roads ${stateObj.code}`, email: `dh.roads@${sc}.samadhan.gov.in`, password, role: 'department_head', department: createdDepts[0]._id, designation: 'Head - Roads Dept', bandwidth: 50, state: stateObj.code, isActive: true },
      { name: `Head Water ${stateObj.code}`, email: `dh.water@${sc}.samadhan.gov.in`, password, role: 'department_head', department: createdDepts[1]._id, designation: 'Head - Water Board', bandwidth: 50, state: stateObj.code, isActive: true },
      { name: `Officer Roads 1 ${stateObj.code}`, email: `officer1@${sc}.samadhan.gov.in`, password, role: 'employee', department: createdDepts[0]._id, designation: 'Junior Engineer', bandwidth: 20, state: stateObj.code, isActive: true },
      { name: `Officer Roads 2 ${stateObj.code}`, email: `officer2@${sc}.samadhan.gov.in`, password, role: 'employee', department: createdDepts[0]._id, designation: 'Assistant Engineer', bandwidth: 20, state: stateObj.code, isActive: true },
      { name: `Officer Water 1 ${stateObj.code}`, email: `officer3@${sc}.samadhan.gov.in`, password, role: 'employee', department: createdDepts[1]._id, designation: 'Water Inspector', bandwidth: 20, state: stateObj.code, isActive: true },
      { name: `Officer Water 2 ${stateObj.code}`, email: `officer4@${sc}.samadhan.gov.in`, password, role: 'employee', department: createdDepts[1]._id, designation: 'Plumbing Head', bandwidth: 20, state: stateObj.code, isActive: true },
      { name: `Citizen 1 ${stateObj.code}`, email: `citizen1@${sc}.example.com`, password, role: 'citizen', ward: 'Ward 1', district: stateObj.districts[0], state: stateObj.code, isActive: true },
      { name: `Citizen 2 ${stateObj.code}`, email: `citizen2@${sc}.example.com`, password, role: 'citizen', ward: 'Ward 2', district: stateObj.districts[1] || stateObj.districts[0], state: stateObj.code, isActive: true },
      { name: `Citizen 3 ${stateObj.code}`, email: `citizen3@${sc}.example.com`, password, role: 'citizen', ward: 'Ward 3', district: stateObj.districts[2] || stateObj.districts[0], state: stateObj.code, isActive: true },
    ];
    const users = await User.insertMany(usersRaw);

    // Link Dept Heads
    await Department.findByIdAndUpdate(createdDepts[0]._id, { head: users[1]._id });
    await Department.findByIdAndUpdate(createdDepts[1]._id, { head: users[2]._id });

    const citizens = users.filter((u) => u.role === 'citizen');
    const officers = users.filter((u) => u.role === 'employee');
    const complaints = [];

    // Create ~15 complaints for this state
    for (let i = 0; i < 15; i++) {
      const tmpl = complaintTemplates[i % complaintTemplates.length];
      const baseCoords = stateObj.coords;
      const coords = [baseCoords[0] + (Math.random() - 0.5) * 0.1, baseCoords[1] + (Math.random() - 0.5) * 0.1];
      const deptIndex = i % createdDepts.length;
      const citizen = citizens[i % citizens.length];
      
      // Attempt to pick a valid officer from this department, if none fallback to undefined
      const eligibleOfficers = officers.filter(o => o.department.toString() === createdDepts[deptIndex]._id.toString());
      const officer = eligibleOfficers.length > 0 ? eligibleOfficers[i % eligibleOfficers.length] : undefined;
      
      const status = statuses[i % statuses.length];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const isAssignedLike = ['assigned', 'in_progress', 'pending_verification', 'resolved'].includes(status) && !!officer;

      complaints.push({
        ...tmpl,
        state: stateObj.code,
        location: { type: 'Point', coordinates: coords },
        address: `Ward ${i + 1}, ${stateObj.districts[i % stateObj.districts.length]}, ${stateObj.name}`,
        district: stateObj.districts[i % stateObj.districts.length],
        ward: `Ward ${i + 1}`,
        citizen: citizen._id,
        department: createdDepts[deptIndex]._id,
        status,
        assignedTo: isAssignedLike ? officer._id : undefined,
        assignedAt: isAssignedLike ? createdAt : undefined,
        resolvedAt: status === 'resolved' ? new Date(createdAt.getTime() + 48 * 3600000) : undefined,
        resolutionTimeHours: status === 'resolved' ? 48 : undefined,
        dueDate: new Date(createdAt.getTime() + 72 * 3600000),
        source: ['portal', 'mobile_app', 'social_media'][i % 3],
        aiConfidence: 0.7 + Math.random() * 0.25,
        timeline: [{ status: 'submitted', message: 'Complaint submitted', updatedBy: citizen._id, timestamp: createdAt }],
        createdAt
      });
    }

    for (const c of complaints) {
      await Complaint.create(c);
    }
    console.log(`Seeded State: ${stateObj.name} (${stateObj.code})`);
  }

  console.log('\n✅ SEED COMPLETE! Login credentials (password: password123):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:  admin@samadhan.gov.in');
  console.log('CM (MH):      cm@mh.samadhan.gov.in');
  console.log('CM (UP):      cm@up.samadhan.gov.in');
  console.log('Dept Head:    dh.roads@mh.samadhan.gov.in');
  console.log('Officer:      officer1@mh.samadhan.gov.in');
  console.log('Citizen:      citizen1@mh.example.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
