import { useState, useRef, useCallback } from "react";
import { 
  ref, uploadBytesResumable, getDownloadURL, deleteObject 
} from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import {
  ImagePlus, Star, Trash2, GripVertical,
  AlertCircle, CheckCircle, X, Eye
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { toast } from "sonner";

interface ProductImage {
  id: string;              // unique local ID for drag tracking
  file?: File;             // present if just selected, not yet uploaded
  previewUrl: string;      // local blob URL or Firebase URL
  storageUrl?: string;     // Firebase Storage download URL (set after upload)
  storagePath?: string;    // Firebase Storage path (for deletion)
  uploadProgress: number;  // 0–100
  status: "pending"        // selected, not yet uploading
         | "uploading"     // upload in progress
         | "done"          // uploaded, storageUrl is set
         | "error";        // upload failed
  errorMessage?: string;
}

interface ProductImageUploadProps {
  productId: string;                    // used for Storage path
  initialImages?: string[];             // existing URLs when editing a product
  onChange: (urls: string[]) => void;   // called whenever order/set changes
  maxImages?: number;                   // default 6
}

export function ProductImageUpload({
  productId,
  initialImages = [],
  onChange,
  maxImages = 6,
}: ProductImageUploadProps) {

  // Initialize from existing images when editing
  const [images, setImages] = useState<ProductImage[]>(() =>
    initialImages.map((url, i) => ({
      id: `existing-${i}`,
      previewUrl: url,
      storageUrl: url,
      storagePath: undefined, // existing images: path unknown, skip delete
      uploadProgress: 100,
      status: "done" as const,
    }))
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Primary image is always index 0
  const primaryImage = images[0] ?? null;

  // Notify parent whenever images change — only pass successfully uploaded URLs
  const notifyParent = useCallback((updatedImages: ProductImage[]) => {
    const urls = updatedImages
      .filter(img => img.status === "done" && img.storageUrl)
      .map(img => img.storageUrl!);
    onChange(urls);
  }, [onChange]);

  // ─── File Validation ─────────────────────────────────────────
  const validateFile = (file: File): string | null => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return "Only JPG, PNG, or WebP images are allowed";
    }
    if (file.size > 8 * 1024 * 1024) {
      return "Each image must be under 8MB";
    }
    return null;
  };

  // ─── Add Files ───────────────────────────────────────────────
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;

    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const toProcess = fileArray.slice(0, remaining);
    if (fileArray.length > remaining) {
      toast.warning(`Only ${remaining} more image${remaining > 1 ? "s" : ""} can be added`);
    }

    // Validate all files first
    const validFiles: File[] = [];
    for (const file of toProcess) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    // Create pending image entries
    const newImages: ProductImage[] = validFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadProgress: 0,
      status: "pending" as const,
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // Upload each file
    for (const imgEntry of newImages) {
      uploadImage(imgEntry, updatedImages);
    }
  }, [images, maxImages, productId]);

  // ─── Upload Single Image ──────────────────────────────────────
  const uploadImage = useCallback((imgEntry: ProductImage, currentImages: ProductImage[]) => {
    if (!imgEntry.file) return;

    const storagePath = `products/${productId}/${imgEntry.id}.jpg`;
    const storageRef = ref(storage, storagePath);

    // Mark as uploading
    setImages(prev => prev.map(img =>
      img.id === imgEntry.id
        ? { ...img, status: "uploading" }
        : img
    ));

    const uploadTask = uploadBytesResumable(storageRef, imgEntry.file, {
      contentType: imgEntry.file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setImages(prev => prev.map(img =>
          img.id === imgEntry.id
            ? { ...img, uploadProgress: progress }
            : img
        ));
      },
      (error) => {
        console.error("Upload error:", error);
        setImages(prev => {
          const updated = prev.map(img =>
            img.id === imgEntry.id
              ? { ...img, status: "error" as const, errorMessage: "Upload failed. Tap to retry." }
              : img
          );
          notifyParent(updated);
          return updated;
        });
        toast.error(`Failed to upload image. You can retry.`);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setImages(prev => {
          const updated = prev.map(img =>
            img.id === imgEntry.id
              ? {
                  ...img,
                  status: "done" as const,
                  storageUrl: downloadUrl,
                  storagePath,
                  uploadProgress: 100,
                }
              : img
          );
          notifyParent(updated);
          return updated;
        });
      }
    );
  }, [productId, notifyParent]);

  // ─── Retry Failed Upload ──────────────────────────────────────
  const retryUpload = (imgId: string) => {
    setImages(prev => {
      const updated = prev.map(img =>
        img.id === imgId
          ? { ...img, status: "pending" as const, errorMessage: undefined, uploadProgress: 0 }
          : img
      );
      const imgToRetry = updated.find(img => img.id === imgId);
      if (imgToRetry) uploadImage(imgToRetry, updated);
      return updated;
    });
  };

  // ─── Remove Image ─────────────────────────────────────────────
  const removeImage = async (imgId: string) => {
    const imgToRemove = images.find(img => img.id === imgId);
    if (!imgToRemove) return;

    // Delete from Firebase Storage if uploaded
    if (imgToRemove.storagePath) {
      try {
        const storageRef = ref(storage, imgToRemove.storagePath);
        await deleteObject(storageRef);
      } catch {
        // Ignore — may already be deleted
      }
    }

    // Revoke blob URL to free memory
    if (imgToRemove.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imgToRemove.previewUrl);
    }

    setImages(prev => {
      const updated = prev.filter(img => img.id !== imgId);
      notifyParent(updated);
      return updated;
    });

    toast.success("Image removed");
  };

  // ─── Reorder via Drag ─────────────────────────────────────────
  const handleReorder = (newOrder: ProductImage[]) => {
    setImages(newOrder);
    notifyParent(newOrder);
  };

  // ─── Set Primary (move to index 0) ───────────────────────────
  const setPrimary = (imgId: string) => {
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === imgId);
      if (idx <= 0) return prev; // already primary
      const updated = [...prev];
      const [selected] = updated.splice(idx, 1);
      updated.unshift(selected);
      notifyParent(updated);
      return updated;
    });
    toast.success("Primary image updated");
  };

  // ─── Drag & Drop on Upload Zone ───────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const isFull = images.length >= maxImages;
  const hasUploading = images.some(img => img.status === "uploading");
  const doneCount = images.filter(img => img.status === "done").length;

  return (
    <div className="space-y-4">

      {/* ── Label ── */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-navy uppercase tracking-widest font-bold">
            Product Images
            <span className="text-red-600 ml-1">*</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Upload up to {maxImages} images · JPG, PNG or WebP · Max 8MB each
          </p>
        </div>
        <span className="text-xs font-bold text-navy bg-gold/10 px-2 py-1 rounded-full uppercase tracking-widest border border-gold/20">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* ── Primary Image Hero Preview ── */}
      <AnimatePresence mode="wait">
        {primaryImage && (
          <motion.div
            key={primaryImage.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden 
                       border-[3px] border-gold shadow-md group bg-muted"
          >
            <img
              src={primaryImage.previewUrl}
              alt="Primary product image — will appear on product cards"
              className="w-full h-full object-contain bg-muted"
            />

            {/* Primary badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 
                            bg-gold text-white text-[10px] font-bold tracking-widest uppercase
                            px-3 py-1.5 rounded-full shadow-lg border border-gold-light/50">
              <Star size={12} className="fill-white" />
              Primary Image
            </div>

            {/* Upload progress overlay */}
            {primaryImage.status === "uploading" && (
              <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm flex flex-col 
                              items-center justify-center gap-3">
                <div className="w-48 bg-white/30 rounded-full h-2 overflow-hidden border border-white/10">
                  <motion.div
                    className="bg-gold h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${primaryImage.uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white text-xs font-bold uppercase tracking-widest">
                  Uploading {primaryImage.uploadProgress}%
                </p>
              </div>
            )}

            {/* Done overlay */}
            {primaryImage.status === "done" && (
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center 
                                justify-center shadow-lg border-2 border-white">
                  <CheckCircle size={16} className="text-white" />
                </div>
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 
                            transition-all duration-300 flex flex-col sm:flex-row items-center 
                            justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setLightboxImage(primaryImage.previewUrl)}
                className="bg-white text-navy text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl 
                           flex items-center gap-2 shadow-lg hover:bg-gold hover:text-white 
                           transition-colors"
              >
                <Eye size={14} /> Preview
              </button>
              <button
                type="button"
                onClick={() => removeImage(primaryImage.id)}
                className="bg-white text-red-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl 
                           flex items-center gap-2 shadow-lg hover:bg-red-600 hover:text-white 
                           transition-colors"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>

            {/* Tip */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <p className="text-white/90 text-xs text-center font-medium drop-shadow-md
                            opacity-0 group-hover:opacity-100 transition-opacity">
                This image appears on product cards and at the top of your listing
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Thumbnail Strip with Drag-to-Reorder ── */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          
          {/* Instructions */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <GripVertical size={14} className="text-muted-foreground/50" />
              Drag to reorder · First image is primary
            </p>
            {hasUploading && (
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">
                Uploading...
              </p>
            )}
            {!hasUploading && doneCount > 0 && (
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
                {doneCount}/{images.length} done
              </p>
            )}
          </div>

          {/* Reorderable thumbnail grid */}
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={handleReorder}
            className="space-y-2"
          >
            <AnimatePresence>
              {images.map((img, index) => (
                <Reorder.Item
                  key={img.id}
                  value={img}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="select-none"
                >
                  <div
                    className={`flex items-center gap-3 bg-white rounded-xl 
                                border transition-all duration-200 p-2.5 pr-3 shadow-sm
                                ${index === 0
                                  ? "border-gold/50 shadow-gold/5 bg-gold/[0.02]"
                                  : "border-border hover:border-primary/30 hover:shadow-md"
                                }
                                ${img.status === "error"
                                  ? "border-red-300 bg-red-50"
                                  : ""
                                }`}
                  >
                    {/* Drag handle */}
                    <div className="cursor-grab active:cursor-grabbing 
                                    text-muted-foreground/40 hover:text-primary 
                                    flex-shrink-0 px-1.5 touch-none transition-colors">
                      <GripVertical size={18} />
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border/50
                                    flex-shrink-0 bg-muted flex items-center justify-center">
                      {img.previewUrl ? (
                         <img
                           src={img.previewUrl}
                           alt={`Product image ${index + 1} of ${images.length}`}
                           className={`w-full h-full object-cover transition-opacity
                                       ${img.status === "uploading" ? "opacity-50" : "opacity-100"}`}
                         />
                      ) : (
                         <ImagePlus size={20} className="text-muted-foreground/30" />
                      )}

                      {/* Upload progress overlay on thumbnail */}
                      {img.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-[1px]">
                          <div className="w-10 bg-white/30 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gold h-full rounded-full transition-all"
                              style={{ width: `${img.uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status indicators */}
                      {img.status === "done" && (
                        <div className="absolute top-1 right-1 w-4 h-4 
                                        bg-green-500 rounded-full flex items-center justify-center shadow-sm border border-white">
                          <CheckCircle size={10} className="text-white" />
                        </div>
                      )}
                      {img.status === "error" && (
                        <div className="absolute top-1 right-1 w-4 h-4 
                                        bg-red-500 rounded-full flex items-center justify-center shadow-sm border border-white">
                          <AlertCircle size={10} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest
                                           text-gold font-bold flex-shrink-0 bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20">
                            <Star size={10} className="fill-gold" />
                            Primary
                          </span>
                        )}
                        <span className="text-sm font-medium text-primary truncate">
                          {img.file?.name ?? `Image ${index + 1}`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {img.status === "uploading" && (
                        <div className="mt-1 w-full bg-muted rounded-full h-1.5 overflow-hidden border border-border/50">
                          <motion.div
                            className="bg-gold h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${img.uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}

                      {img.status === "done" && (
                        <p className="text-xs text-green-600 font-medium">Uploaded ✓</p>
                      )}

                      {img.status === "pending" && (
                        <p className="text-xs text-muted-foreground">Waiting to upload...</p>
                      )}

                      {img.status === "error" && (
                        <button
                          type="button"
                          onClick={() => retryUpload(img.id)}
                          className="text-xs text-red-600 font-medium hover:underline hover:text-red-700
                                     flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          {img.errorMessage} Tap to retry
                        </button>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 pl-2 border-l border-border/50">

                      {/* Set as Primary */}
                      {index !== 0 && img.status === "done" && (
                        <button
                          type="button"
                          onClick={() => setPrimary(img.id)}
                          title="Set as primary image"
                          className="w-8 h-8 rounded-xl bg-gold/10 text-gold 
                                     hover:bg-gold hover:text-white hover:shadow-md
                                     flex items-center justify-center 
                                     transition-all duration-200 border border-gold/20"
                        >
                          <Star size={14} />
                        </button>
                      )}

                      {/* Preview */}
                      <button
                        type="button"
                        onClick={() => setLightboxImage(img.previewUrl)}
                        title="Preview"
                        className="w-8 h-8 rounded-xl bg-muted text-muted-foreground 
                                   hover:bg-primary hover:text-white hover:shadow-md
                                   flex items-center justify-center 
                                   transition-all duration-200 border border-border/50 hover:border-primary"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        title="Remove image"
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 
                                   hover:bg-red-600 hover:text-white hover:shadow-md
                                   flex items-center justify-center 
                                   transition-all duration-200 border border-red-100 hover:border-red-600"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

        </div>
      )}
      
      {/* ── Drag & Drop Upload Zone ── */}
      {!isFull && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer
                      transition-all duration-300 flex flex-col items-center 
                      justify-center gap-4 py-10
                      ${isDragOver
                        ? "border-gold bg-gold/10 scale-[1.01] shadow-lg shadow-gold/5"
                        : "border-border bg-muted/40 hover:border-gold hover:bg-gold/5 hover:shadow-md"
                      }`}
        >
          <motion.div
            animate={isDragOver ? { scale: 1.15 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center 
                       justify-center border border-border"
          >
            <ImagePlus
              size={24}
              className={isDragOver ? "text-gold" : "text-primary/40"}
            />
          </motion.div>

          <div className="text-center">
            <p className="text-base font-bold text-primary">
              {isDragOver ? "Drop images here" : "Add more images"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1 font-medium bg-white px-2 py-0.5 rounded-md inline-block border border-border/50">
              {maxImages - images.length} slot{maxImages - images.length !== 1 ? "s" : ""} remaining
            </p>
          </div>

          {images.length === 0 && (
            <span className="text-[10px] bg-gold/10 text-gold px-3 py-1.5 
                             rounded-full font-bold uppercase tracking-widest border border-gold/20 mt-2">
              First image becomes your primary image
            </span>
          )}
        </div>
      )}

      {/* ── Hidden File Input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ── Tip / Helper Text ── */}
      {!isFull && images.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">💡</span>
          <div className="text-sm text-ink/70 leading-relaxed space-y-1.5">
            <p>
              <strong className="text-primary">Primary image</strong> appears on 
              product cards and at the top of your listing. Choose your best 
              photo as primary.
            </p>
            <p>
              Drag the <GripVertical size={14} className="inline text-muted-foreground bg-white border border-border rounded-sm p-[1px] mx-0.5" /> handle 
              to reorder. Click <Star size={12} className="inline text-gold bg-gold/10 border border-gold/20 rounded-sm p-[2px] mx-0.5" /> 
              on any image to make it primary.
            </p>
            <p>
              Use natural lighting and a clean background for best results. 
            </p>
          </div>
        </div>
      )}

      {/* ── Lightbox / Full Preview ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm 
                       flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Full size product image preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 
                           backdrop-blur-md rounded-full flex items-center border border-white/20
                           justify-center text-white hover:bg-white hover:text-navy hover:scale-110
                           transition-all duration-200 shadow-xl"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
