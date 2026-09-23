const mongoose = require('mongoose');

const sharedDocumentSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
            index: true,
        },
        shared_with_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        permission_type: {
            type: String,
            enum: ['VIEW', 'DOWNLOAD', 'EDIT'],
            default: 'VIEW',
        },
        shared_at: {
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
                ret.share_id = ret._id;
                if (!ret.shared_at && ret.createdAt) {
                    ret.shared_at = ret.createdAt;
                }
                delete ret.__v;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model('SharedDocument', sharedDocumentSchema);
