
/**
 * Cloudinary Upload Utility
 * Handles image uploads to Cloudinary using unsigned presets.
 */

const CLOUDINARY_CLOUD_NAME = 'dxlmlhpfy';

const UPLOAD_PRESET = 'ml_default';

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file object from input
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImage = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
