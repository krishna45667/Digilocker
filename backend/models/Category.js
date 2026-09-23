const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        category_name: {
            type: String,
            required: [true, 'Please provide category name'],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model('Category', categorySchema);
