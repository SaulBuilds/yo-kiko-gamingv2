import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

/**
 * SEO component to handle meta tags for different pages
 * 
 * @param {SEOProps} props - SEO props including title, description, image, and canonical URL
 * @returns {JSX.Element} - Helmet component with SEO meta tags
 */
export function SEO({ 
  title = "Yo-Kiko | Web3 Gaming Platform", 
  description = "Play, compete, and earn rewards on Yo-Kiko, the premier Web3 gaming platform connecting classic arcade games with blockchain rewards.",
  image = "/assets/yo-kiko_social.png",
  canonical
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://yo-kiko.com";
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={fullUrl} />}
      
      {/* Favicon */}
      <link rel="icon" href="/assets/favicon.ico" />
      <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    </Helmet>
  );
}