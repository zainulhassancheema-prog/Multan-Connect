import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { ImagePlus, Camera, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Using sonner as per project standard

interface BannerUploadProps {
  currentBannerUrl: string | null;
  onBannerChange: (url: string) => void;
  onBannerRemove: () => void;
  userId: string;
}

export function BannerUpload({ currentBannerUrl, onBannerChange, onBannerRemove, userId }: BannerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a JPG, PNG, or WebP image";
    }
    if (file.size > maxSize) {
      return "Image must be smaller than 5MB";
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to Firebase Storage
    await uploadBanner(file);
  };

  const uploadBanner = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Storage path: /users/{userId}/shop_banner.jpg
      const storageRef = ref(storage, `users/${userId}/shop_banner_${Date.now()}.jpg`);
      
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Upload failed. Please try again.");
          setPreviewUrl(null);
          setUploading(false);
          toast.error("Banner upload failed. Please try again.");
        },
        async () => {
          // Upload complete — get download URL
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Call parent callback with new URL
          // Parent saves this to Firestore
          onBannerChange(downloadUrl);
          
          setUploading(false);
          setUploadProgress(0);
          toast.success("Banner uploaded successfully!");
        }
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setPreviewUrl(null);
      setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    // If we only have a pre-existing URL and not currently uploaded
    // just clear it. Firebase deleteObject can be error prone if path isn't exactly matched.
    // The previous implementation used `shop_banner_${Date.now()}` so path might not match simply `shop_banner.jpg`.
    // It's safer to just clear the URL in firestore. We'll try to delete from full path if needed but for now just clear local.
    
    try {
      // Clear preview and notify parent
      setPreviewUrl(null);
      onBannerRemove();
      toast.success("Banner removed.");
    } catch (err) {
      toast.error("Failed to remove banner. Please try again.");
    }
  };

  const hasBanner = previewUrl || currentBannerUrl;

  return (
    <div className="space-y-4">
      
      <div>
        <label className="text-sm font-bold text-navy flex items-center gap-2 tracking-widest uppercase mb-1">
          Shop Banner Photo
        </label>
        <p className="text-xs text-muted-foreground font-serif italic text-gold">
          Shown at the top of your public shop page. Recommended size: 1200 × 400px.
        </p>
      </div>

      {/* Upload zone or preview */}
      {hasBanner ? (
        // Preview with change/remove overlay
        <div className="relative w-full h-48 rounded-2xl overflow-hidden group border border-border">
          
          {/* Banner preview */}
          <img
            src={previewUrl || currentBannerUrl || ''}
            alt="Current shop banner — click to change"
            className="w-full h-full object-cover"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 
                          transition-all duration-300" />

          {/* Action buttons — appear on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            
            {/* Change button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white text-navy text-xs font-medium 
                         px-4 py-2 rounded-xl hover:bg-gold hover:text-white 
                         transition-colors duration-200 shadow-lg"
            >
              <Camera size={14} />
              Change Banner
            </button>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemoveBanner}
              className="flex items-center gap-2 bg-white text-red-600 text-xs font-medium 
                         px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white 
                         transition-colors duration-200 shadow-lg"
            >
              <Trash2 size={14} />
              Remove
            </button>

          </div>

          {/* Upload progress bar overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-navy/60 flex flex-col items-center 
                            justify-center gap-3 backdrop-blur-sm">
              <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gold h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-xs font-bold uppercase tracking-wider">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* "Banner" label badge — always visible */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="text-xs bg-black/40 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm uppercase tracking-wider font-bold">
              Shop Banner
            </span>
          </div>

        </div>
      ) : (
        // Empty upload zone
        <div className="w-full h-48 rounded-2xl border-2 border-dashed border-border 
                        bg-muted/30 hover:border-gold hover:bg-gold/5
                        flex flex-col items-center justify-center gap-3
                        cursor-pointer transition-all duration-300 group"
             onClick={() => fileInputRef.current?.click()}>
          
          <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center 
                          justify-center group-hover:bg-gold/10 transition-colors">
            <ImagePlus size={22} className="text-navy/40 group-hover:text-gold" />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-bold text-navy">Upload Shop Banner</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WebP · Max 5MB
            </p>
          </div>

          <span className="text-xs bg-gold/10 text-gold px-4 py-1.5 rounded-full 
                           font-bold uppercase tracking-wider border border-gold/20">
            Click to browse
          </span>

        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Tip box */}
      {!hasBanner && (
        <div className="flex items-start gap-3 bg-navy/5 rounded-xl p-4 mt-2">
          <span className="text-navy text-sm flex-shrink-0 mt-0.5">💡</span>
          <p className="text-sm text-ink/70 leading-relaxed">
            A great banner shows your workshop, craft process, or finished 
            products. Landscape orientation works best. Avoid text in the 
            image as it may be cropped on mobile screens.
          </p>
        </div>
      )}
      
      {uploading && (
        <p className="text-xs text-muted-foreground italic">
          Please wait for the upload to complete before saving changes.
        </p>
      )}

    </div>
  );
}
