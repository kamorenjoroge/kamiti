// models/Tool.ts
import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  description: { type: String },
  price: { type: Number, required: true },
  color: {
    type: [String], // Accept multiple color names like ['blue', 'black']
    validate: [arrayLimitColors, 'Maximum 10 colors allowed']
  },
  image: {
    type: [String],
    validate: [arrayLimitImages, 'Maximum 10 images allowed']
  }
}, { timestamps: true });

function arrayLimitColors(val: string[]): boolean {
  return val.length <= 10; // Customize as needed
}

function arrayLimitImages(val: string[]): boolean {
  return val.length <= 10; // Customize as needed
}

export default mongoose.models.Tool || mongoose.model('Tool', toolSchema);
