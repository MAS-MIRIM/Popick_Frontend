// Setup real fetch for API tests
if (typeof global.fetch === 'undefined') {
  global.fetch = require('cross-fetch');
}