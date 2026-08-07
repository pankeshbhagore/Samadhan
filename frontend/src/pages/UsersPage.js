import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, toggleUserActive, getDepartments, deleteUser, updateUser } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Search, UserX, UserCheck, Edit2, Trash2 } from 'lucide-react';

const ROLES = ['citizen', 'employee', 'department_head', 'cm', 'super_admin'];
const CREATE_ROLES = ['employee', 'department_head', 'cm'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '', designation: '', bandwidth: 10, state: '' });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getAllUsers({ role: roleFilter || undefined, search: search || undefined, limit: 100 })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { getDepartments().then(({ data }) => setDepartments(data.departments)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editId) {
        await updateUser(editId, form);
        toast.success('User updated successfully');
      } else {
        await createUser(form);
        toast.success('User created successfully');
      }
      setShowCreate(false);
      setEditId(null);
      setForm({ name: '', email: '', password: '', role: 'employee', department: '', designation: '', bandwidth: 10, state: '' });
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save user'));
    } finally { setCreating(false); }
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department?._id || '', designation: u.designation || '', bandwidth: u.bandwidth || 10, state: u.state || '' });
    setShowCreate(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete user'));
    }
  };

  const handleToggle = async (u) => {
    try {
      const { data } = await toggleUserActive(u._id);
      setUsers((list) => list.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(data.user.isActive ? `${u.name} reactivated` : `${u.name} deactivated`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Action failed'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>👥 User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{users.length} total users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', role: 'employee', department: '', designation: '', bandwidth: 10, state: '' }); setShowCreate(true); }}><Plus size={16} /> Add User</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" placeholder="Search by name or email..." style={{ paddingLeft: 32 }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ flex: '1 1 160px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No users found</div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className="badge" style={{ background: '#eff6ff', color: 'var(--primary)', textTransform: 'capitalize' }}>{u.role?.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.department?.name || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: u.isActive ? '#f0fdf4' : '#fef2f2', color: u.isActive ? '#166534' : '#991b1b' }}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`btn btn-sm btn-icon ${u.isActive ? 'btn-outline' : 'btn-success'}`} title={u.isActive ? "Deactivate" : "Reactivate"} onClick={() => handleToggle(u)}>
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-sm btn-icon btn-outline" title="Edit" onClick={() => openEdit(u)}><Edit2 size={14} /></button>
                        <button className="btn btn-sm btn-icon" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Delete" onClick={() => handleDelete(u._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit User' : 'Add New User'}</div>
              <button className="btn btn-icon" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                {!editId && (
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-control" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} minLength={6} required />
                  </div>
                )}
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select className="form-control" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                      {CREATE_ROLES.map((r) => <option key={r} value={r}>{r === 'cm' ? 'State Admin' : r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select className="form-control" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
                      <option value="">None (All India)</option>
                      {require('../utils/statesConfig').default.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-2">
                  {['employee', 'department_head'].includes(form.role) && (
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-control" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                        <option value="">None</option>
                        {departments.filter(d => !form.state || d.state === form.state).map((d) => <option key={d._id} value={d._id}>{d.name} {!form.state ? `(${d.state})` : ''}</option>)}
                      </select>
                    </div>
                  )}
                  {form.role === 'employee' && (
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input className="form-control" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
                    </div>
                  )}
                </div>
                {form.role === 'employee' && (
                  <div className="form-group">
                    <label className="form-label">Bandwidth (max complaints)</label>
                    <input type="number" className="form-control" min={1} value={form.bandwidth} onChange={(e) => setForm((f) => ({ ...f, bandwidth: parseInt(e.target.value) || 1 }))} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Saving...' : (editId ? 'Update User' : 'Create User')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
