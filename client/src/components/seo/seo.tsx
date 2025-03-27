import React from "react";
import { MetaTags } from "./meta-tags";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "game" | "product";
  url?: string;
  children?: React.ReactNode;
}

/**
 * SEO component to handle metadata for pages
 * 
 * @param {SEOProps} props - Component properties
 * @returns {JSX.Element} - SEO component with metadata
 */
export function SEO({
  title,
  description,
  image = "/assets/yo.png",
  type = "website",
  url,
  children,
}: SEOProps) {
  // Build URL from current location if not provided
  const pageUrl = url || window.location.href;
  
  // Build page-specific metadata
  const pageTitle = title 
    ? `${title} | Yokiko Gaming Platform` 
    : "Yokiko Gaming Platform | Web3 Gaming and Wagering";
  
  const pageDescription = description || 
    "Play competitive blockchain-powered games, place skill-based wagers, and compete in tournaments on the Yokiko Web3 Gaming Platform.";

  return (
    <>
      <MetaTags
        title={pageTitle}
        description={pageDescription}
        image={image}
        url={pageUrl}
        type={type}
      />
      {children}
    </>
  );
}