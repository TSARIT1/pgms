import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPlan, updatePlan, getPlanById } from '../../services/subscriptionService';
import { FiPlus, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import './SubscriptionPlanForm.css';

export default function SubscriptionPlanForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    durationType: 'MONTH', // Default to MONTH
    price: '',
    offer: '',
    features: [''],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const plan = await getPlanById(id);
      setFormData({
        name: plan.name,
        duration: plan.duration,
        durationType: plan.durationType || 'MONTH',
        price: plan.price,
        offer: plan.offer || '',
        features: JSON.parse(plan.features || '[""]'),
      });
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load plan details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        features: newFeatures,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.duration || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const filteredFeatures = formData.features.filter((f) => f.trim() !== '');
    if (filteredFeatures.length === 0) {
      setError('Please add at least one feature');
      return;
    }

    try {
      setLoading(true);
      const planData = {
        name: formData.name,
        duration: parseInt(formData.duration),
        durationType: formData.durationType,
        price: parseFloat(formData.price),
        offer: formData.offer || null,
        features: JSON.stringify(filteredFeatures),
      };

      if (isEditMode) {
        await updatePlan(id, planData);
      } else {
        await createPlan(planData);
      }

      navigate('/superadmin/subscriptions/manage');
    } catch (error) {
      console.error('Error saving plan:', error);
      setError(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-plan-form-page">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/superadmin/subscriptions/manage')}>
          <FiArrowLeft /> Back to Plans
        </button>
        <h1>{isEditMode ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="plan-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Plan Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Premium Plan"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder={formData.durationType === 'MONTH' ? 'e.g., 1, 3, 6, 12' : 'e.g., 30, 90, 180, 365'}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="durationType">Duration Type *</label>
            <select
              id="durationType"
              name="durationType"
              value={formData.durationType}
              onChange={handleChange}
              required
            >
              <option value="MONTH">Month(s)</option>
              <option value="DAY">Day(s)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 999"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="offer">Offer (Optional)</label>
            <input
              type="text"
              id="offer"
              name="offer"
              value={formData.offer}
              onChange={handleChange}
              placeholder="e.g., Save 30%, 30% OFF"
            />
          </div>
        </div>

        <div className="form-group features-group">
          <label>Features *</label>
          <div className="features-list">
            {formData.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn-remove-feature"
                  onClick={() => removeFeature(index)}
                  disabled={formData.features.length === 1}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-feature" onClick={addFeature}>
            <FiPlus /> Add Feature
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/superadmin/subscriptions/manage')}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : isEditMode ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
