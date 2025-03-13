'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';

interface CameraButtonProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  postId: string;
}

const CameraModal = ({ 
  isOpen, 
  onClose, 
  onCapture,
  postId
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCapture: (success: boolean) => void; 
  postId: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

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
    const scale = 0.5; 
    canvas.width = videoRef.current.videoWidth * scale;
    canvas.height = videoRef.current.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      setCapturedImage(imageData);
    }
  };

  const shareReaction = async () => {
    if (!capturedImage) return;
    
    setIsSharing(true);
    try {
      console.log("Envoi de la réaction...", postId);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: capturedImage,
          postId: postId
        }),
      });
      
      const data = await response.json();
      console.log("Réponse du serveur:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du partage de la réaction");
      }
      
      toast({
        title: "Réaction partagée",
        description: "Votre réaction a été partagée avec succès"
      });
      
      onCapture(true);
      setIsSuccess(true);
      
      router.refresh();
      
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de partager votre réaction",
        variant: "destructive",
      });
      onCapture(false);
    } finally {
      setIsSharing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="bg-neutral-900 rounded-lg overflow-hidden max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="text-lg font-medium text-white">
            {isSuccess 
              ? "Réaction partagée avec succès" 
              : "Capturer votre réaction"
            }
          </h3>
          <button 
            onClick={handleCloseModal}
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
              <div className="flex flex-wrap justify-center gap-3">
                {isSuccess ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="bg-green-500/20 text-green-500 rounded-md p-2 text-center">
                      Votre réaction a été partagée avec succès !
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="px-4 py-2 rounded-md border border-neutral-700 text-white hover:bg-neutral-800"
                    >
                      Recommencer
                    </button>
                    <button
                      onClick={shareReaction}
                      disabled={isSharing}
                      className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSharing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Partage...</span>
                        </>
                      ) : (
                        "Partager ma réaction"
                      )}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 w-full mt-2"
                    >
                      Annuler
                    </button>
                  </>
                )}
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
              <div className="flex flex-col gap-4 items-center">
                <button
                  onClick={capturePhoto}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-12 w-12 flex items-center justify-center"
                >
                  <Camera size={20} />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CameraButton = ({ onClick, postId }: CameraButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    setShowModal(true);
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleCapture = (success: boolean) => {
    if (success) {
      setHasReacted(true);
    }
  };

  return (
    <>
      <div
        className={`flex flex-row items-center text-neutral-500 gap-2 cursor-pointer transition hover:text-orange-500 relative`}
        onClick={handleClick}
        role='button'
      >
        <Camera size={20} />
        {hasReacted && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
        )}
      </div>

      {showModal && (
        <CameraModal 
          isOpen={showModal}
          onClose={handleClose}
          onCapture={handleCapture}
          postId={postId}
        />
      )}
    </>
  );
};

export default CameraButton;