(function() {
  // Wait for the DOM to load before injecting the popup
  document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Create the CSS styles for the top banner
    const style = document.createElement('style');
    style.textContent = `
      #backup-popup-overlay {
        position: fixed;
        top: 16px;
        left: 0;
        width: 100%;
        z-index: 999999;
        display: flex;
        justify-content: center;
        padding: 0 16px;
        font-family: 'Space Grotesk', sans-serif;
        pointer-events: none; /* Let clicks pass through the blank space */
        animation: slideDownBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      #backup-popup-modal {
        background: rgba(17, 24, 39, 0.92);
        backdrop-filter: blur(16px);
        color: #f1f5f9;
        padding: 14px 18px 14px 20px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 18px;
        max-width: 600px;
        width: 100%;
        border: 1px solid rgba(51, 65, 85, 0.6);
        box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06);
        pointer-events: auto; /* Enable clicks on the banner itself */
      }
      #backup-popup-modal h3 {
        margin: 0;
        font-size: 14.5px;
        font-weight: 500;
        line-height: 1.4;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      #backup-popup-modal h3::before {
        content: "⚠";
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.12);
        color: #f87171;
        font-size: 14px;
      }
      .backup-btn-group {
        display: flex;
        gap: 10px;
        margin-left: auto;
      }
      .backup-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        text-decoration: none;
        white-space: nowrap;
      }
      .backup-btn:active {
        transform: scale(0.96);
      }
      .backup-redirect-btn {
        background: linear-gradient(135deg, #22c55e, #10b981);
        color: #000;
        box-shadow: 0 4px 12px rgba(34,197,94,0.25);
      }
      .backup-redirect-btn:hover {
        box-shadow: 0 6px 18px rgba(34,197,94,0.4);
        transform: translateY(-1px);
      }
      .backup-close-btn {
        background: rgba(51, 65, 85, 0.5);
        color: #f1f5f9;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .backup-close-btn:hover {
        background: rgba(71, 85, 105, 0.7);
      }
      @keyframes slideDownBanner {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      
      /* Responsive layout adjustment for smaller screens */
      @media (max-width: 600px) {
        #backup-popup-overlay {
          padding: 0 10px;
        }
        #backup-popup-modal {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }
        #backup-popup-modal h3 {
          white-space: normal;
          justify-content: center;
          margin-bottom: 4px;
        }
        .backup-btn-group {
          margin-left: 0;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);

    // 2. Create the container overlay
    const overlay = document.createElement('div');
    overlay.id = 'backup-popup-overlay';

    // 3. Create the banner modal
    const modal = document.createElement('div');
    modal.id = 'backup-popup-modal';

    // 4. Add the notification text
    const text = document.createElement('h3');
    text.textContent = "Blocked? Here's our backup sites!";
    modal.appendChild(text);

    // 5. Create the buttons container
    const btnGroup = document.createElement('div');
    btnGroup.className = 'backup-btn-group';

    // 6. Create the redirect button using the launcher fetch method
    const redirectBtn = document.createElement('a');
    redirectBtn.href = "https://aniitsukicoded.github.io/backups/index.html";
    redirectBtn.className = "backup-btn backup-redirect-btn";
    redirectBtn.textContent = "Backup Sites";
    redirectBtn.onclick = function(e) {
      e.preventDefault();
      
      const destination = redirectBtn.href;
      const originalText = redirectBtn.textContent;
      redirectBtn.textContent = "Loading...";

      fetch(destination)
        .then(r => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .then(html => {
          redirectBtn.textContent = originalText;
          const win = window.open("about:blank", "_blank");
          if (!win) {
            alert("Popup blocked — please allow popups for this site.");
            return;
          }
          win.document.open();
          win.document.write(html);
          win.document.close();
        })
        .catch(err => {
          // Fallback to opening normally if fetch fails
          redirectBtn.textContent = originalText;
          window.open(destination, "_blank", "noopener");
        });
    };
    btnGroup.appendChild(redirectBtn);

    // 7. Create the close/exit button
    const closeBtn = document.createElement('button');
    closeBtn.className = "backup-btn backup-close-btn";
    closeBtn.textContent = "Dismiss";
    closeBtn.onclick = function() {
      // Slide up and remove when clicked
      overlay.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      overlay.style.transform = "translateY(-100%)";
      overlay.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    btnGroup.appendChild(closeBtn);

    // 8. Assemble and inject into document
    modal.appendChild(btnGroup);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

  });
})();
