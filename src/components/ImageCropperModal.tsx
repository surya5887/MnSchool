import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set standard resolution for logo
  const TARGET_SIZE = 256;
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    TARGET_SIZE,
    TARGET_SIZE
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (croppedAreaPixels) {
        setIsUploading(true);
        // Simulate an upload progress bar
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          await new Promise(r => setTimeout(r, 40)); // 400ms fake upload
        }
        
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay" 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div 
          className="modal-content" 
          style={{ background: '#fff', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', minHeight: '400px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#333' }}>Adjust School Logo</h2>
            <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}><X size={18} /></button>
          </div>
          
          <div style={{ position: 'relative', flex: 1, background: '#f0f2f5', borderRadius: '16px', overflow: 'hidden', minHeight: '250px' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={setZoom}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, color: '#444', fontSize: '0.9rem' }}>Zoom Level</label>
              <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
            </div>
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.05} 
              aria-labelledby="Zoom" 
              onChange={(e) => setZoom(Number(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            {isUploading ? (
              <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '12px', height: '44px', overflow: 'hidden', position: 'relative' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}
                >
                </motion.div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: progress > 50 ? 'white' : 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', zIndex: 10, mixBlendMode: 'difference' }}>
                  Uploading... {progress}%
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'transparent', color: '#555', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 2, padding: '12px', background: 'var(--primary-gradient)', color: 'white', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'all 0.2s' }}><Check size={18} /> Apply Logo</button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;
