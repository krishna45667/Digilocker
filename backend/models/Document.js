const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        file_name: {
            type: String,
            required: [true, 'Please add a file name'],
            trim: true,
            index: true,
        },
        file_type: {
            type: String,
            required: [true, 'Please add a file type'],
        },
        file_path: {
            type: String,
            required: [true, 'Please add a file path'],
        },
        file_size: {
            type: Number,
            required: [true, 'Please add a file size'],
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            },
        ],
        upload_date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id;
                ret.user_id = ret.user;
                if (!ret.upload_date && ret.createdAt) {
                    ret.upload_date = ret.createdAt;
                }
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model('Document', documentSchema);
