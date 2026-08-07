import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BrainCircuit, AlertOctagon, TrendingDown, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import statesConfig, { getStateName } from '../utils/statesConfig';

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Angry, Neutral, Positive

export default function SentimentPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { limit: 500 };
        if (user?.role === 'super_admin' && filterState) {
          params.state = filterState;
        }
        const res = await getComplaints(params);
        setData(res.data.complaints || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterState, user?.role]);

  if (loading) return <div className="page-content" style={{ padding: 32, textAlign: 'center' }}>Loading AI Sentiment Analysis...</div>;

  const sentimentCounts = { Angry: 0, Neutral: 0, Positive: 0 };
  const wardFrustration = {};
  
  const highlyFrustrated = [];

  data.forEach(c => {
    const sentiment = c.aiAnalysis?.sentiment || 'Neutral';
    if (sentimentCounts[sentiment] !== undefined) {
      sentimentCounts[sentiment]++;
    } else {
      sentimentCounts['Neutral']++;
    }

    if (sentiment === 'Angry') {
      wardFrustration[c.ward] = (wardFrustration[c.ward] || 0) + 1;
      highlyFrustrated.push(c);
    }
  });

  const pieData = [
    { name: 'Angry', value: sentimentCounts.Angry },
    { name: 'Neutral', value: sentimentCounts.Neutral },
    { name: 'Positive', value: sentimentCounts.Positive }
  ];

  const barData = Object.keys(wardFrustration)
    .map(ward => ({ ward: `Ward ${ward}`, count: wardFrustration[ward], rawWard: ward }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="page-content" style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrainCircuit size={32} color="var(--primary)" /> Public Sentiment Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            AI-driven analysis of citizen frustration levels and geographic hotspots.
            {user?.role !== 'super_admin' && ` Showing data for ${getStateName(user?.state)}.`}
          </p>
        </div>
        
        {user?.role === 'super_admin' && (
          <select className="form-control" style={{ width: 200 }} value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="">All India (Global View)</option>
            {statesConfig.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderColor: 'var(--danger)', background: 'rgba(239,68,68,0.05)' }}>
          <div className="stat-icon" style={{ background: 'var(--danger)', color: 'white' }}><AlertOctagon size={24} /></div>
          <div><div className="stat-value" style={{ color: 'var(--danger)' }}>{sentimentCounts.Angry}</div><div className="stat-label">Frustrated Citizens</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning)', color: 'white' }}><TrendingDown size={24} /></div>
          <div><div className="stat-value">{barData[0]?.ward || 'N/A'}</div><div className="stat-label">Most Critical Ward</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success)', color: 'white' }}><Users size={24} /></div>
          <div><div className="stat-value">{sentimentCounts.Positive}</div><div className="stat-label">Satisfied Outcomes</div></div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Overall Sentiment Breakdown</div></div>
          <div className="card-body" style={{ height: 300 }}>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value"
                    className="clickable-chart-area"
                    onClick={(entry) => navigate(`/complaints`)}
                  >
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Frustration by Ward</div></div>
          <div className="card-body" style={{ height: 300 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="ward" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#ef4444" 
                    name="Angry Complaints" 
                    radius={[4, 4, 0, 0]}
                    className="clickable-chart-area"
                    onClick={(entry) => navigate(`/complaints`)}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>}
          </div>
        </div>
      </div>

      {highlyFrustrated.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Urgent Sentiment Interventions</div>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Department</th>
                  <th>Officer Assigned</th>
                </tr>
              </thead>
              <tbody>
                {highlyFrustrated.slice(0, 10).map((c) => (
                  <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/complaints/${c._id}`)} className="hover-bg">
                    <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{c.title}</td>
                    <td>Ward {c.ward}</td>
                    <td>{c.department?.name || 'Unassigned'}</td>
                    <td>{c.assignedTo?.name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
