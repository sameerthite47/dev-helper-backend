const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true,
    },
    imageUrl: {
        type: String,
        required:true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = Category = mongoose.model('categories', CategorySchema);

