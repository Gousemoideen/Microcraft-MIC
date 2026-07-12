import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CertificateSchema = new Schema(
  {
    cert_id: { type: String, required: true, unique: true, index: true },
    participant_email: { type: String, required: true, index: true },
    participant_name: { type: String, required: true },
    event_name: { type: String, required: true },
    event_code: { type: String, required: true },
    event_type: { type: String, enum: ["workshop", "hackathon"], required: true },
    cloudinary_url: { type: String, required: true },
    issued_at: { type: Date, required: true },
  },
  { collection: "certificates", timestamps: true }
);

export type CertificateDocument = InferSchemaType<typeof CertificateSchema>;

export default (mongoose.models.Certificate as Model<CertificateDocument>) ||
  mongoose.model<CertificateDocument>("Certificate", CertificateSchema);
