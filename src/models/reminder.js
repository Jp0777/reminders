const mongoose = require('mongoose');
const reminderSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: false,
        unique: true
    },
    // scheduledDate: {
    //     type: String,
    //     required: true,

    // },
    scheduledTime: {
        type: Date,
        required: true,

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
}
)

const reminder = mongoose.model('reminder', reminderSchema)



module.exports = reminder;