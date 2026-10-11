const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    salary: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Map _id to id for React frontend compatibility
employeeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);