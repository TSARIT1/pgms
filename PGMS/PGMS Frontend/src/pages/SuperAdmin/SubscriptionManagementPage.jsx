import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllPlans, deletePlan, togglePlanStatus } from '../../services/subscriptionService';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiPackage } from 'react-icons/fi';
import './SubscriptionManagementPage.css';

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, planId: null, planName: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await togglePlanStatus(id);
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      alert('Failed to toggle plan status');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlan(deleteModal.planId);
      setDeleteModal({ show: false, planId: null, planName: '' });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const parseFeatures = (featuresString) => {
    try {
      return JSON.parse(featuresString);
    } catch {
      return [];
    }
  };

  if (loading) {
    return <div className="loading">Loading subscription plans...</div>;
  }

  return (
    <motion.div 
      className="subscription-management-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Modern Header with Gradient */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
            <FiPackage />
          </div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: '700' }}>
              Manage Subscription Plans
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0 0 0' }}>
              Create, edit, and manage subscription tiers for PG/Hostel owners
            </p>
          </div>
        </div>
        <motion.button 
          className="btn-primary" 
          onClick={() => navigate('/superadmin/subscriptions/new')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FiPlus /> Create New Plan
        </motion.button>
      </motion.div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${!plan.isActive ? 'inactive' : ''}`}>
            <div className="plan-header">
              <div>
                <h3>{plan.name}</h3>
                {plan.offer && <div className="offer-badge">{plan.offer}</div>}
              </div>
              <button
                className="toggle-btn"
                onClick={() => handleToggleStatus(plan.id)}
                title={plan.isActive ? 'Deactivate' : 'Activate'}
              >
                {plan.isActive ? <FiToggleRight size={24} color="#4CAF50" /> : <FiToggleLeft size={24} color="#999" />}
              </button>
            </div>

            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">{plan.price.toLocaleString()}</span>
              <span className="duration">
                /{plan.duration} {plan.durationType === 'MONTH' ? `month${plan.duration > 1 ? 's' : ''}` : `day${plan.duration > 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="plan-details">
              <div className="detail-item">
                <strong>Status:</strong>{' '}
                <span className={`status ${plan.isActive ? 'active' : 'inactive'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="plan-features">
              <h4>Features</h4>
              <ul>
                {parseFeatures(plan.features).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button
                className="btn-edit"
                onClick={() => navigate(`/superadmin/subscriptions/edit/${plan.id}`)}
              >
                <FiEdit2 /> Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => setDeleteModal({ show: true, planId: plan.id, planName: plan.name })}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, planId: null, planName: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Subscription Plan</h3>
            <p>Are you sure you want to delete "{deleteModal.planName}"?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteModal({ show: false, planId: null, planName: '' })}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
