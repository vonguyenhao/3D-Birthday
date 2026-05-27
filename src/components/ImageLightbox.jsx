import { X } from 'lucide-react';

function ImageLightbox({ image, onClose }) {
  if (!image) {
    return null;
  }

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Memory image'}
      onClick={onClose}
    >
      <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button lightbox-close" type="button" onClick={onClose} aria-label="Close image">
          <X size={18} aria-hidden="true" />
        </button>
        <img
          src={image.src}
          alt={image.alt || 'Birthday memory'}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            event.currentTarget.nextElementSibling.hidden = false;
          }}
        />
        <div className="image-fallback" hidden>
          <strong>Memory image not found</strong>
          <p>Add this file to public/images/memories/ when you are ready.</p>
        </div>
        {image.caption ? <p className="lightbox-caption">{image.caption}</p> : null}
      </div>
    </div>
  );
}

export default ImageLightbox;
