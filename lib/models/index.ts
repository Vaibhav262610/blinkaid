// Import all models to ensure they are registered
import './User';
import './Admin';
import './Ambulance';
import './EmergencyRequest';

// Re-export models for convenience
export { default as User } from './User';
export { default as Admin } from './Admin';
export { default as Ambulance } from './Ambulance';
export { default as EmergencyRequest } from './EmergencyRequest'; 