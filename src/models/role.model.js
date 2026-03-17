const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true } // VD: 'admin', 'user', 'artist'
});

module.exports = mongoose.model('Role', roleSchema);