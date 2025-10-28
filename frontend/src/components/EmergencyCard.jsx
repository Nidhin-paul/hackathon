import { Phone, MapPin, Trash2, Edit } from 'lucide-react';
import './EmergencyCard.css';

const EmergencyCard = ({ contact, onCall, onDelete, onEdit }) => {
  const categoryColors = {
    police: 'bg-blue-500',
    fire: 'bg-red-500',
    medical: 'bg-green-500',
    ambulance: 'bg-green-600',
    disaster: 'bg-orange-500',
    other: 'bg-gray-500',
  };

  const categoryIcons = {
    police: '🚓',
    fire: '🚒',
    medical: '🏥',
    ambulance: '🚑',
    disaster: '⚠️',
    other: '📞',
  };

  return (
    <div className="emergency-card">
      <div className={`emergency-card-stripe ${contact.category}`}></div>
      <div className="emergency-card-content">
        <div className="emergency-card-header">
          <div className="emergency-card-info">
            <span className="emergency-card-icon">{categoryIcons[contact.category]}</span>
            <div className="emergency-card-details">
              <h3>{contact.name}</h3>
              <span className="emergency-card-category">
                {contact.category}
              </span>
            </div>
          </div>
          {contact.isPredefined && (
            <span className="emergency-card-badge">
              Official
            </span>
          )}
        </div>

        {contact.description && (
          <p className="emergency-card-description">{contact.description}</p>
        )}

        <div className="emergency-card-phone">
          <Phone className="w-4 h-4 emergency-card-phone-icon" />
          <span className="emergency-card-phone-number">{contact.phone}</span>
        </div>

        {contact.location?.address && (
          <div className="emergency-card-location">
            <MapPin className="w-4 h-4 emergency-card-location-icon" />
            <span className="emergency-card-location-text">{contact.location.address}</span>
          </div>
        )}

        <div className="emergency-card-actions">
          <button onClick={() => onCall(contact)} className="emergency-card-call-button">
            <Phone className="w-5 h-5" />
            Call Now
          </button>
          
          {!contact.isPredefined && onEdit && onDelete && (
            <>
              <button
                onClick={() => onEdit(contact)}
                className="emergency-card-edit-button"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(contact._id)}
                className="emergency-card-delete-button"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCard;
