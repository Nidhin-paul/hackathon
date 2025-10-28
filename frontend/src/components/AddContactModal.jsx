import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { getCurrentLocation, getAddressFromCoordinates } from '../utils/geolocation';
import './AddContactModal.css';

const AddContactModal = ({ isOpen, onClose, onSubmit, editContact }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'other',
    description: '',
    isPredefined: false,
    location: {
      latitude: null,
      longitude: null,
      address: '',
    },
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (editContact) {
      setFormData(editContact);
    } else {
      setFormData({
        name: '',
        phone: '',
        category: 'other',
        description: '',
        isPredefined: false,
        location: {
          latitude: null,
          longitude: null,
          address: '',
        },
      });
    }
  }, [editContact, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await getCurrentLocation();
      const address = await getAddressFromCoordinates(
        position.latitude,
        position.longitude
      );
      setFormData((prev) => ({
        ...prev,
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          address: address,
        },
      }));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {editContact ? 'Edit Contact' : 'Add Emergency Contact'}
          </h2>
          <button onClick={onClose} className="modal-close-button">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-label modal-label-required">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="modal-input"
              placeholder="Enter contact name"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label modal-label-required">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="modal-input"
              placeholder="Enter phone number"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label modal-label-required">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="modal-select"
            >
              <option value="police">Police</option>
              <option value="fire">Fire Department</option>
              <option value="medical">Medical</option>
              <option value="ambulance">Ambulance</option>
              <option value="disaster">Disaster Management</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="modal-textarea"
              placeholder="Enter description"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-checkbox-label">
              <input
                type="checkbox"
                name="isPredefined"
                checked={formData.isPredefined}
                onChange={(e) => setFormData(prev => ({ ...prev, isPredefined: e.target.checked }))}
                className="modal-checkbox"
              />
              <span className="modal-checkbox-text">
                Mark as Official Contact
              </span>
            </label>
            <p className="modal-help-text">
              Official contacts will display an "Official" badge
            </p>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">
              Location
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={loadingLocation}
              className="modal-location-button"
            >
              <MapPin className="w-5 h-5" />
              {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
            </button>
            {formData.location.address && (
              <p className="modal-location-text">
                📍 {formData.location.address}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-button-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-button-submit">
              {editContact ? 'Update' : 'Add'} Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
