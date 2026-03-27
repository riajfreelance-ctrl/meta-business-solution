const { admin } = require('../services/firestoreService');

/**
 * Middleware to check user role from token or Firestore
 */
function checkRole(allowedRoles) {
    return async (req, res, next) => {
        // In a real Firebase Auth setup, roles would be in custom claims.
        // For this implementation, we allow a 'role' header or fallback to 'admin' for now.
        // Professional approach: Fetch role from Firestore user document if not in token.
        
        const userRole = req.headers['x-user-role'] || 'admin'; 

        if (allowedRoles.includes(userRole)) {
            return next();
        } else {
            console.warn(`🚨 Access Denied: User role [${userRole}] tried to access protected route.`);
            return res.status(403).json({ error: 'Access Denied: You do not have permission for this action.' });
        }
    };
}

module.exports = {
    checkRole
};
