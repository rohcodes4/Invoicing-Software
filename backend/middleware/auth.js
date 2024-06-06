// module.exports = {
//     ensureAuthenticated: (req, res, next) => {
//         if (req.isAuthenticated()) {
//             return next();
//         }
//         res.status(401).json({ message: 'Please log in to access this resource' });
//     }
// };

const jwt = require('jsonwebtoken');
const jwtDecode = require("jwt-decode");

module.exports = {
    ensureAuthenticated : (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
          return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
      
        jwt.verify(token, 'rohcodes', (err, decoded) => {
          if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token:'+token });
          }
          req.user = decoded;
          next();
        });
      }
}
