import React from 'react';
import { Share2, MessageCircle, Twitter, Facebook, Linkedin } from 'lucide-react';

function SocialShare({ title, description, url }) {
  const shareData = {
    title: title || 'Daily Activity Tracker & Analytics Dashboard',
    description: description || 'Track your daily outreach activities with real-time analytics. Monitor DMs, comments, replies, follow-ups, and calls with beautiful charts and insights.',
    url: url || window.location.href
  };

  const shareOnWhatsApp = () => {
    const text = `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `${shareData.title}\n\n${shareData.url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="social-share">
      <h4 style={{ marginBottom: '12px', color: 'var(--neutral-700)' }}>
        <Share2 size={16} className="inline mr-2" />
        Share this page
      </h4>
      <div className="share-buttons">
        <button 
          onClick={shareOnWhatsApp}
          className="share-btn whatsapp"
          title="Share on WhatsApp"
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>
        
        <button 
          onClick={shareOnTwitter}
          className="share-btn twitter"
          title="Share on Twitter"
        >
          <Twitter size={18} />
          Twitter
        </button>
        
        <button 
          onClick={shareOnFacebook}
          className="share-btn facebook"
          title="Share on Facebook"
        >
          <Facebook size={18} />
          Facebook
        </button>
        
        <button 
          onClick={shareOnLinkedIn}
          className="share-btn linkedin"
          title="Share on LinkedIn"
        >
          <Linkedin size={18} />
          LinkedIn
        </button>
        
        <button 
          onClick={shareNative}
          className="share-btn native"
          title="Share"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>
    </div>
  );
}

export default SocialShare; 