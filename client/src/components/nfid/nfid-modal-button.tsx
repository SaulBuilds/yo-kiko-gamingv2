import { useState, useEffect, useRef } from 'react';
import { useAuth as useNfidAuth } from '@nfid/identitykit/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface NFIDModalButtonProps {
  onClose?: () => Promise<void>;
  className?: string;
}

/**
 * NFIDModalButton component
 * A specialized button for connecting to NFID within a modal context
 * 
 * This component handles both the button UI and captures the NFID UI
 * elements to relocate them within the modal container.
 * 
 * @param {NFIDModalButtonProps} props - Component props
 * @returns {JSX.Element} The NFID modal button component
 */
export function NFIDModalButton({ onClose, className }: NFIDModalButtonProps) {
  const { connect, isConnecting } = useNfidAuth();
  const [error, setError] = useState<string | null>(null);
  const nfidContainerRef = useRef<HTMLDivElement>(null);
  const [nfidUIVisible, setNfidUIVisible] = useState(false);

  // Setup handler to capture and relocate NFID UI to our container
  useEffect(() => {
    // Define a style for NFID elements when they're in our container
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Container styling when NFID UI is present */
      .nfid-container-active {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 8px;
        margin-top: 1rem;
      }
      
      /* Style for NFID UI elements once relocated */
      .nfid-container-active > div {
        position: static !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 8px !important;
        background: transparent !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create an observer to watch for NFID UI elements appearing
    const observer = new MutationObserver((mutations) => {
      // Look for NFID UI elements when they appear
      const nfidElements = document.querySelector('div[style*="position: fixed"][style*="bottom: 0"]');
      if (nfidElements && nfidContainerRef.current) {
        try {
          // Stop observing to prevent loops
          observer.disconnect();
          
          // Move the element to our container
          nfidContainerRef.current.innerHTML = '';
          nfidContainerRef.current.appendChild(nfidElements);
          nfidContainerRef.current.classList.add('nfid-container-active');
          
          // Mark that we have NFID UI visible
          setNfidUIVisible(true);
          
          // Re-observe after modifications
          observer.observe(document.body, { childList: true, subtree: true });
        } catch (err) {
          console.error("Error relocating NFID interface:", err);
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      observer.disconnect();
      document.head.removeChild(styleElement);
      setNfidUIVisible(false);
    };
  }, []);

  // Handle NFID connection
  const handleNFIDConnect = async () => {
    try {
      setError(null);
      console.log("Activating NFID wallet interface...");
      await connect();
      
      // Wait for connection to complete before closing the modal
      // We don't automatically close here because we want to
      // let the user interact with the NFID UI if needed
    } catch (err: any) {
      console.error("Error connecting to NFID wallet:", err);
      setError(err?.message || "Failed to connect to NFID wallet");
    }
  };

  return (
    <div className="w-full">
      {/* Error display */}
      {error && (
        <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Only show the button if NFID UI is not yet visible */}
      {!nfidUIVisible && (
        <Button 
          onClick={handleNFIDConnect}
          disabled={isConnecting}
          className={`w-full py-6 relative ${className}`}
          variant="outline"
        >
          {isConnecting ? (
            <Spinner className="mr-2" />
          ) : (
            <img 
              src="/assets/nfid-logo.svg" 
              alt="NFID" 
              className="w-6 h-6 mr-2"
            />
          )}
          <div className="flex flex-col items-start">
            <span className="font-semibold">NFID</span>
            <span className="text-xs text-muted-foreground">Connect with Internet Computer</span>
          </div>
        </Button>
      )}
      
      {/* Container where NFID UI will be moved */}
      <div 
        ref={nfidContainerRef} 
        className={`w-full rounded-md overflow-hidden transition-all duration-200 ${
          nfidUIVisible ? 'opacity-100' : 'opacity-0 h-0'
        }`}
      ></div>
    </div>
  );
}