import React, { useContext, createContext, useState, useEffect } from 'react';
import { StorageManager } from './StorageManager';

// Create a context for role-based access
const RoleContext = createContext({
  userId: null,
  currentRole: 'player', // Default role
  currentEntityId: null, // ID of current championship/tournament
  isAdmin: false,
  isOwner: false,
  setCurrentEntity: () => {},
  checkAccess: () => false
});

/**
 * RoleBasedWrapper component - Provides role-based access control
 * Wraps content that requires permission checking
 */
export const RoleBasedWrapper = ({ 
  children,
  entityId, // Championship or tournament ID
  entityType = 'championship', // 'championship' or 'tournament'
  requiredRole = 'player', // 'player', 'admin', or 'owner'
  fallback = null // Component to show if access denied
}) => {
  const { userId, checkAccess, setCurrentEntity } = useContext(RoleContext);
  
  // Set current entity when component mounts
  useEffect(() => {
    if (entityId) {
      setCurrentEntity(entityId, entityType);
    }
  }, [entityId, entityType, setCurrentEntity]);
  
  // Check if user has required access
  const hasAccess = checkAccess(requiredRole, entityId, entityType);
  
  if (!userId) {
    // User not logged in or identified
    return fallback || <p>User identification required</p>;
  }
  
  if (!hasAccess) {
    // User doesn't have required access
    return fallback || <p>You don't have permission to access this content</p>;
  }
  
  // User has access, render children
  return <>{children}</>;
};

/**
 * RoleProvider component - Provides role context to the application
 */
export const RoleProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [currentEntityId, setCurrentEntityId] = useState(null);
  const [currentEntityType, setCurrentEntityType] = useState('championship');
  const [currentRole, setCurrentRole] = useState('player');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Initialize user ID on component mount
  useEffect(() => {
    // Try to load user ID from storage
    let id = StorageManager.loadItem('padelUserId');
    
    if (!id) {
      // Generate a new user ID if none exists
      id = `user_${Date.now()}`;
      StorageManager.saveItem('padelUserId', id);
    }
    
    setUserId(id);
  }, []);
  
  /**
   * Set the current entity (championship/tournament) and determine user's role
   */
  const setCurrentEntity = (entityId, entityType = 'championship') => {
    if (!entityId) return;
    
    setCurrentEntityId(entityId);
    setCurrentEntityType(entityType);
    
    // Determine role for the entity
    if (entityType === 'championship') {
      const championship = StorageManager.getChampionshipById(entityId);
      
      if (!championship) {
        setCurrentRole('player');
        setIsAdmin(false);
        setIsOwner(false);
        return;
      }
      
      // Check if user is an administrator
      const adminRecord = championship.administrators?.find(admin => admin.userId === userId);
      
      if (adminRecord) {
        setIsAdmin(true);
        setIsOwner(adminRecord.role === 'owner');
        setCurrentRole(adminRecord.role);
      } else if (championship.players?.includes(userId)) {
        // User is a player but not an admin
        setCurrentRole('player');
        setIsAdmin(false);
        setIsOwner(false);
      } else {
        // User has no role in this championship
        setCurrentRole(null);
        setIsAdmin(false);
        setIsOwner(false);
      }
    } else if (entityType === 'tournament') {
      // For tournaments, all authenticated users are considered equal
      // This could be enhanced with tournament-specific roles if needed
      setCurrentRole('player');
      setIsAdmin(true); // In tournaments, all users can edit
      setIsOwner(true); // In tournaments, all users have full access
    }
  };
  
  /**
   * Check if user has the required access level
   */
  const checkAccess = (requiredRole, entityId = currentEntityId, entityType = currentEntityType) => {
    if (!userId || !entityId) return false;
    
    // If not checking against current entity, determine role first
    if (entityId !== currentEntityId || entityType !== currentEntityType) {
      setCurrentEntity(entityId, entityType);
    }
    
    switch (requiredRole) {
      case 'owner':
        return isOwner;
      case 'admin':
        return isAdmin || isOwner;
      case 'player':
        return currentRole !== null; // Any role is sufficient
      default:
        return false;
    }
  };
  
  // Context value
  const contextValue = {
    userId,
    currentRole,
    currentEntityId,
    currentEntityType,
    isAdmin,
    isOwner,
    setCurrentEntity,
    checkAccess
  };
  
  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

/**
 * Custom hook to use the role context
 */
export const useRole = () => {
  const context = useContext(RoleContext);
  
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  
  return context;
};

/**
 * Helper component that only renders content for admin users
 */
export const AdminOnly = ({ children, entityId, entityType, fallback = null }) => {
  return (
    <RoleBasedWrapper 
      entityId={entityId}
      entityType={entityType}
      requiredRole="admin"
      fallback={fallback}
    >
      {children}
    </RoleBasedWrapper>
  );
};

/**
 * Helper component that only renders content for owner users
 */
export const OwnerOnly = ({ children, entityId, entityType, fallback = null }) => {
  return (
    <RoleBasedWrapper 
      entityId={entityId}
      entityType={entityType}
      requiredRole="owner"
      fallback={fallback}
    >
      {children}
    </RoleBasedWrapper>
  );
};

export default RoleBasedWrapper;
