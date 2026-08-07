const User = require('../models/User');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');
const Complaint = require('../models/Complaint');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { getStateFilter } = require('../middleware/stateFilter');

exports.getOfficers = asyncHandler(async (req, res) => {
  const { department, state } = req.query;
  const stateFilter = getStateFilter(req.user);
  const query = { role: { $in: ['employee', 'department_head'] }, isActive: true, ...stateFilter };

  if (department) query.department = department;
  if (req.user.role === 'super_admin' && state) query.state = state;

  const officers = await User.find(query).populate('department', 'name code').select('-password').sort('name');

  const officersWithLoad = officers.map((o) => ({
    ...o.toObject(),
    id: o._id,
    capacityPercent: o.bandwidth > 0 ? Math.round((o.activeComplaints / o.bandwidth) * 100) : 0,
    isFull: o.activeComplaints >= o.bandwidth
  }));

  res.json({ success: true, officers: officersWithLoad });
});

exports.getOfficerPerformance = asyncHandler(async (req, res) => {
  const { state } = req.query;
  const stateFilter = getStateFilter(req.user);
  const query = { role: { $in: ['employee', 'department_head'] }, isActive: true, ...stateFilter };

  if (req.user.role === 'super_admin' && state) {
    query.state = state;
  }

  const officers = await User.find(query).populate('department', 'name').select('-password').sort('-stats.totalResolved');

  const data = officers.map((o) => ({
    id: o._id,
    name: o.name,
    department: o.department?.name,
    designation: o.designation,
    stats: o.stats,
    activeComplaints: o.activeComplaints,
    bandwidth: o.bandwidth,
    capacityPercent: o.bandwidth > 0 ? Math.round((o.activeComplaints / o.bandwidth) * 100) : 0,
    falseClosureRate: o.stats.totalAssigned > 0 ? ((o.stats.falseClosures / o.stats.totalAssigned) * 100).toFixed(1) : '0'
  }));

  res.json({ success: true, officers: data });
});

// Full admin user list with filters
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, state, department, page = 1, limit = 20 } = req.query;
  const query = {};
  
  if (req.user.role === 'cm') {
    query.state = req.user.state;
    if (department) query.department = department;
  } else if (req.user.role === 'department_head') {
    query.state = req.user.state;
    query.department = req.user.department;
    query.role = 'employee';
  } else if (req.user.role === 'super_admin') {
    if (state) query.state = state;
    if (department) query.department = department;
  }

  if (role && !query.role) query.role = role;
  
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (search) query.$or = [{ name: new RegExp(escapeRegex(search), 'i') }, { email: new RegExp(escapeRegex(search), 'i') }];

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).populate('department', 'name code').select('-password').sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum)
  ]);

  res.json({ success: true, users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { email, name, password, phone, role, department, designation, employeeId, bandwidth, ward, district, state } = req.body;
  const existing = await User.findOne({ email: email?.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 400);

  // RBAC for creation
  const targetState = req.user.role === 'super_admin' ? state : req.user.state;
  const targetDepartment = req.user.role === 'department_head' ? req.user.department : department;
  const targetRole = req.user.role === 'department_head' ? 'employee' : role;

  const user = await User.create({ name, email, password, phone, role: targetRole, department: targetDepartment, designation, employeeId, bandwidth, ward, district, state: targetState });
  res.status(201).json({ success: true, user: user.toSafeObject() });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { email, name, phone, role, department, designation, employeeId, bandwidth, ward, district, state, verificationPassword, actionJustification } = req.body;
  
  if (!verificationPassword || !actionJustification || actionJustification.length < 10) {
    throw new AppError('Verification password and justification (min 10 chars) are required', 400);
  }
  const authUser = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(verificationPassword, authUser.password))) {
    throw new AppError('Invalid verification password', 401);
  }

  const updates = { email, name, phone, role, department, designation, employeeId, bandwidth, ward, district, state };
  
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) throw new AppError('User not found', 404);
  
  await AuditLog.create({
    action: 'USER_UPDATED',
    entityType: 'user', entityId: user._id, performedBy: req.user._id,
    state: user.state,
    details: actionJustification
  });
  
  res.json({ success: true, user });
});

// Deactivate/reactivate — was entirely missing before, meaning admins
// had no way to disable a compromised or departing officer's account
exports.toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) throw new AppError('You cannot deactivate your own account', 400);

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  await AuditLog.create({
    action: user.isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
    entityType: 'user', entityId: user._id, performedBy: req.user._id,
    state: user.state
  });

  res.json({ success: true, user: user.toSafeObject() });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { verificationPassword, actionJustification } = req.query; // Usually in body, but this is a DELETE req, sometimes handled via URL or frontend body. To support body in DELETE:
  const pwd = req.body.verificationPassword || verificationPassword;
  const just = req.body.actionJustification || actionJustification;

  if (!pwd || !just || just.length < 10) {
    throw new AppError('Verification password and justification (min 10 chars) are required', 400);
  }
  const authUser = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(pwd, authUser.password))) {
    throw new AppError('Invalid verification password', 401);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) throw new AppError('You cannot delete your own account', 400);

  // Instead of hard delete, we could soft delete, but user requested full CRUD delete
  await User.findByIdAndDelete(req.params.id);

  await AuditLog.create({
    action: 'USER_DELETED',
    entityType: 'user', entityId: user._id, performedBy: req.user._id,
    state: user.state,
    details: just
  });

  res.json({ success: true, message: 'User deleted successfully' });
});

exports.getDepartments = asyncHandler(async (req, res) => {
  const { state } = req.query;
  const query = { isActive: true };
  if (req.user.role !== 'super_admin' && req.user.state) {
    query.state = req.user.state;
  } else if (state) {
    query.state = state;
  }
  const depts = await Department.find(query).populate('head', 'name email phone').sort('name');
  res.json({ success: true, departments: depts });
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, head, complaintCategories, contactEmail, contactPhone, mcd311DeptId, slaHours, state } = req.body;
  const deptState = (req.user.role !== 'super_admin' && req.user.state) ? req.user.state : state;
  if (!deptState) throw new AppError('State is required to create a department', 400);
  
  const dept = await Department.create({ name, code, description, head, complaintCategories, contactEmail, contactPhone, mcd311DeptId, slaHours, state: deptState });
  res.status(201).json({ success: true, department: dept });
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, head, complaintCategories, contactEmail, contactPhone, mcd311DeptId, isActive, slaHours, state, verificationPassword, actionJustification } = req.body;
  
  if (!verificationPassword || !actionJustification || actionJustification.length < 10) {
    throw new AppError('Verification password and justification (min 10 chars) are required', 400);
  }
  const authUser = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(verificationPassword, authUser.password))) {
    throw new AppError('Invalid verification password', 401);
  }

  const updates = { name, code, description, head, complaintCategories, contactEmail, contactPhone, mcd311DeptId, isActive, slaHours, state };
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
  const dept = await Department.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!dept) throw new AppError('Department not found', 404);

  await AuditLog.create({
    action: 'DEPARTMENT_UPDATED',
    entityType: 'department', entityId: dept._id, performedBy: req.user._id,
    state: dept.state,
    details: actionJustification
  });

  res.json({ success: true, department: dept });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const { verificationPassword, actionJustification } = req.query; 
  const pwd = req.body.verificationPassword || verificationPassword;
  const just = req.body.actionJustification || actionJustification;

  if (!pwd || !just || just.length < 10) {
    throw new AppError('Verification password and justification (min 10 chars) are required', 400);
  }
  const authUser = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(pwd, authUser.password))) {
    throw new AppError('Invalid verification password', 401);
  }

  const dept = await Department.findById(req.params.id);
  if (!dept) throw new AppError('Department not found', 404);

  // Check if department has active complaints
  const Complaint = require('../models/Complaint');
  const complaintCount = await Complaint.countDocuments({ department: dept._id });
  if (complaintCount > 0) {
    throw new AppError(`Cannot delete department. It is assigned to ${complaintCount} complaints.`, 400);
  }

  await Department.findByIdAndDelete(req.params.id);

  await AuditLog.create({
    action: 'DEPARTMENT_DELETED',
    entityType: 'department', entityId: dept._id, performedBy: req.user._id,
    state: dept.state,
    details: just
  });

  res.json({ success: true, message: 'Department deleted successfully' });
});

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { suspicious, page = 1, limit = 50 } = req.query;
  const { getStateFilter } = require('../middleware/stateFilter');
  const query = { ...getStateFilter(req.user) };
  if (suspicious === 'true') query.suspicious = true;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, parseInt(limit));

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query).populate('performedBy', 'name role').sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum)
  ]);

  res.json({ success: true, logs, total });
});

exports.getDepartmentAnalysis = asyncHandler(async (req, res) => {
  const departmentId = req.params.id;
  const dept = await Department.findById(departmentId).populate('head', 'name email phone');
  if (!dept) throw new AppError('Department not found', 404);

  // Enforce state boundaries
  if (req.user.role !== 'super_admin' && req.user.state && dept.state !== req.user.state) {
    throw new AppError('Not authorized to access this department', 403);
  }

  // Get all officers in this department
  const officers = await User.find({ department: departmentId, role: { $in: ['employee', 'department_head'] } })
    .select('-password')
    .sort('-stats.totalResolved');

  const officersData = officers.map((o) => ({
    id: o._id,
    name: o.name,
    role: o.role,
    designation: o.designation,
    stats: o.stats,
    activeComplaints: o.activeComplaints,
    bandwidth: o.bandwidth,
    capacityPercent: o.bandwidth > 0 ? Math.round((o.activeComplaints / o.bandwidth) * 100) : 0,
    falseClosureRate: o.stats.totalAssigned > 0 ? ((o.stats.falseClosures / o.stats.totalAssigned) * 100).toFixed(1) : '0'
  }));

  // Get complaint aggregates
  const complaints = await Complaint.aggregate([
    { $match: { department: dept._id } },
    { $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResolutionTime: { $avg: '$resolutionTimeHours' },
        criticalCount: { $sum: { $cond: ['$isCritical', 1, 0] } },
        slaBreaches: { $sum: { $cond: [{ $gt: ['$resolutionTimeHours', dept.slaHours] }, 1, 0] } }
      }
    }
  ]);

  const recentComplaints = await Complaint.find({ department: dept._id })
    .sort('-createdAt')
    .limit(10)
    .populate('citizen', 'name')
    .populate('assignedTo', 'name');

  res.json({
    success: true,
    department: dept,
    officers: officersData,
    complaintStats: complaints,
    recentComplaints
  });
});

exports.getOfficerAnalysis = asyncHandler(async (req, res) => {
  const officerId = req.params.id;
  const officer = await User.findById(officerId).select('-password').populate('department');
  
  if (!officer || !['employee', 'department_head'].includes(officer.role)) {
    throw new AppError('Officer not found', 404);
  }

  // Enforce state boundaries
  if (req.user.role !== 'super_admin' && req.user.state && officer.state !== req.user.state) {
    throw new AppError('Not authorized to access this officer', 403);
  }

  // Get recent complaints
  const recentComplaints = await Complaint.find({ assignedTo: officerId })
    .sort('-createdAt')
    .limit(15)
    .populate('citizen', 'name');

  // Find any AI anomalies for this specific officer
  const { scanOfficerAnomalies } = require('../services/anomalyDetection');
  const allAnomalies = await scanOfficerAnomalies();
  const officerAnomalies = allAnomalies.find(a => a.officer._id.toString() === officerId) || null;

  res.json({
    success: true,
    officer,
    recentComplaints,
    anomalies: officerAnomalies
  });
});

