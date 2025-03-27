import React from "react";
import { Helmet } from "react-helmet";

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({
  title = "Yokiko Gaming Platform | Web3 Gaming and Wagering",
  description = "Play competitive blockchain-powered games, place skill-based wagers, and compete in tournaments on the Yokiko Web3 Gaming Platform.",
  image = "/assets/yo.png",
  url = "https://yokiko.com",
  type = "website",
}: MetaTagsProps) {
  // Ensure image is an absolute URL
  const absoluteImage = image.startsWith("/") 
    ? `${window.location.origin}${image}`
    : image;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImage} />
      
      {/* Additional SEO Tags */}
      <meta name="keywords" content="web3 gaming, blockchain games, crypto gaming, play to earn, gaming platform, nft games, skill-based wagering" />
      <meta name="author" content="Yokiko Gaming" />
      <meta name="robots" content="index, follow" />
      <meta name="canonical" content={url} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4f46e5" />
      
      {/* Language and Locale */}
      <meta property="og:locale" content="en_US" />
      <html lang="en" />
    </Helmet>
  );
}