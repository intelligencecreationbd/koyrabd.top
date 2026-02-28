
/**
 * Utility service for converting images to base64 strings to be stored in Firebase.
 */

export async function uploadImageToServer(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('ফাইলটি পড়তে সমস্যা হয়েছে।'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}
