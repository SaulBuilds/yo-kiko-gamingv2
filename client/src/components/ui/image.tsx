import { forwardRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Extended image props that include all standard HTML image attributes plus additional styling options
 */
export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Determines if the image should fill its container
   */
  fill?: boolean;
}

/**
 * Image component that extends the native img element with additional functionality
 * 
 * @param {ImageProps} props - Image properties
 * @returns {JSX.Element} - The rendered image component
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fill, alt = "", ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(
          "rounded-md", 
          fill && "object-cover w-full h-full",
          className
        )}
        alt={alt}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";