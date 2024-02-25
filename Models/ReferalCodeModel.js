const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referralCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        minLength: 6,
        maxLength: 6,
        uppercase: true,
        validate: {
            validator: function(value) {
                return value === value.toUpperCase();
            },
            message: props => `Code must be in uppercase letters`
        }
    },
    discount: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value >= 1 && value <= 75;
            },
            message: props => `Discount (${props.value}) must be between 1 and 75!`
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    }
});

// Middleware to convert code to uppercase before saving
referralCodeSchema.pre("save", function(next) {
    this.code = this.code.toUpperCase();
    next();
});

module.exports = mongoose.model("Code", referralCodeSchema);
