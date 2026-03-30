/**
 * Alias của User — toàn bộ auth / follow / seeder nên dùng cùng một model.
 * Schema thật nằm trong User.js (followers, following, hash password, v.v.).
 */
module.exports = require('./User.js');
