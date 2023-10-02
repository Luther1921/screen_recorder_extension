// Function to generate a unique session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = generateSessionId;
