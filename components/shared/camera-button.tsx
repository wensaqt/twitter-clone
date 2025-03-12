'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { toast } from '../ui/use-toast';

interface CameraButtonProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const CameraModal = ({ 
  isOpen, 
  onClose, 
  onCapture 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCapture: (image: string) => void; 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Erreur d'accès à la caméra:", err);
          toast({
            title: "Erreur d'accès à la caméra",
            description: "Vérifiez que vous avez autorisé l'accès à la caméra",
            variant: "destructive",
          });
          onClose();
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
    }
  };

  const savePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-lg overflow-hidden max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="text-lg font-medium text-white">Capturer votre réaction</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-neutral-800 text-neutral-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4">
          {capturedImage ? (
            <div className="space-y-4">
              <div className="bg-black rounded-md overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Capture" 
                  className="max-h-60 w-full object-contain" 
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={retakePhoto}
                  className="px-4 py-2 rounded-md border border-neutral-700 text-white hover:bg-neutral-800"
                >
                  Recommencer
                </button>
                <button
                  onClick={savePhoto}
                  className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                >
                  Partager
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-black rounded-md overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-12 w-12 flex items-center justify-center"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CameraButton = ({ onClick }: CameraButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [capturedReaction, setCapturedReaction] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    setShowModal(true);
  };

  const handleCapture = (image: string) => {
    setCapturedReaction(image);
    toast({
      title: "Réaction capturée",
      description: "Votre réaction a été ajoutée au tweet",
    });
  };

  return (
    <>
      <div
        className={`flex flex-row items-center text-neutral-500 gap-2 cursor-pointer transition hover:text-orange-500`}
        onClick={handleClick}
        role='button'
      >
        <Camera size={20} />
      </div>

      <CameraModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCapture={handleCapture}
      />
    </>
  );
};

export default CameraButton;