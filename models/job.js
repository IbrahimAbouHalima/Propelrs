const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    salaryRange: { type: Number, required: true },
});

module.exports = mongoose.model('Job', jobSchema);