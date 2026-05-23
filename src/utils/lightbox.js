import { icon } from './icons.js';

export function openLightbox(contentHtml) {
  // Check if exists
  let lightbox = document.getElementById('global-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'global-lightbox';
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100vw';
    lightbox.style.height = '100vh';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    lightbox.style.zIndex = '99999';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.opacity = '0';
    lightbox.style.transition = 'opacity 0.2s ease';
    lightbox.style.cursor = 'zoom-out';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = icon('x', 32);
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '24px';
    closeBtn.style.right = '24px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#ffffff';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '100000';
    
    // Close events
    const close = () => {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        if (lightbox.parentNode) {
          document.body.removeChild(lightbox);
        }
      }, 200);
    };

    lightbox.addEventListener('click', close);
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    lightbox.appendChild(closeBtn);

    const contentContainer = document.createElement('div');
    contentContainer.id = 'lightbox-content';
    contentContainer.style.maxWidth = '90vw';
    contentContainer.style.maxHeight = '90vh';
    contentContainer.style.display = 'flex';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.justifyContent = 'center';
    contentContainer.style.transform = 'scale(0.95)';
    contentContainer.style.transition = 'transform 0.2s ease';
    // Prevent closing when clicking the image itself
    contentContainer.addEventListener('click', (e) => e.stopPropagation());

    lightbox.appendChild(contentContainer);
    document.body.appendChild(lightbox);
  }

  const container = document.getElementById('lightbox-content');
  container.innerHTML = contentHtml;

  // Make image big and cover if it's an image tag
  const img = container.querySelector('img');
  if (img) {
    img.style.maxWidth = '100%';
    img.style.maxHeight = '90vh';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
  } else {
    // If it's emoji, make it huge
    container.style.fontSize = '150px';
  }

  // Trigger animation
  requestAnimationFrame(() => {
    document.getElementById('global-lightbox').style.opacity = '1';
    container.style.transform = 'scale(1)';
  });
}
