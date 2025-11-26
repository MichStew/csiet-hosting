import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['member', 'company', 'admin'],
      default: 'member',
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    employeeName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    major: this.major || '',
    year: this.year || '',
    interests: this.interests || [],
    resumeUrl: this.resumeUrl || '',
    employeeName: this.employeeName || '',
    phone: this.phone || '',
  };
};

export const User = mongoose.model('User', userSchema);
