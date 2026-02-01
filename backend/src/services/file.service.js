import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload CV to Cloudinary
export const uploadCV = async (file, candidateName) => {
  try {
    // Create a safe filename
    const timestamp = Date.now();
    const safeName = candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}_${timestamp}`;

    const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
      folder: 'ats/cvs',
      public_id: filename,
      resource_type: 'raw',
      format: path.extname(file.name).substring(1)
    });

    // Clean up temp file if it exists
    if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
      fs.unlinkSync(file.tempFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('CV Upload Error:', error);
    throw new Error('Failed to upload CV: ' + error.message);
  }
};

// Upload audio recording to Cloudinary
export const uploadAudio = async (file, candidateId) => {
  try {
    const timestamp = Date.now();
    const filename = `interview_${candidateId}_${timestamp}`;

    const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
      folder: 'ats/recordings',
      public_id: filename,
      resource_type: 'video', // Use 'video' for audio files
      format: 'mp3'
    });

    // Clean up temp file
    if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
      fs.unlinkSync(file.tempFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Audio Upload Error:', error);
    throw new Error('Failed to upload audio: ' + error.message);
  }
};

// Delete file from Cloudinary
export const deleteFile = async (fileUrl) => {
  try {
    // Extract public_id from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    
    return { success: true };
  } catch (error) {
    console.error('File Deletion Error:', error);
    // Don't throw error, just log it
    return { success: false };
  }
};
