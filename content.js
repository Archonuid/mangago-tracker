// Content script for Mangago Reading List Tracker
(function() {
  'use strict';

  // Observer to detect list button clicks
  function observeMangaLists() {
    console.log('[Mangago Tracker] Initialized');

    // Function to extract manga information from the page
    function getMangaInfo() {
      const title = document.querySelector('h1, .w-title h3 a, .manga-info h1');
      const currentChapter = extractCurrentChapter();
      
      return {
        title: title ? title.textContent.trim() : null,
        lastChapter: currentChapter,
        url: window.location.href
      };
    }

    // Extract current chapter from URL or page
    function extractCurrentChapter() {
      const url = window.location.href;
      
      // Check if we're on a chapter page
      const chapterMatch = url.match(/\/read-manga\/.*?\/([^\/]+)\/?$/);
      if (chapterMatch) {
        return chapterMatch[1];
      }

      // Try to get from breadcrumbs or page title
      const breadcrumb = document.querySelector('.breadcrumb li:last-child');
      if (breadcrumb) {
        const chapterText = breadcrumb.textContent.match(/chapter[_\s-]*([\d.]+)/i);
        if (chapterText) return chapterText[1];
      }

      return null;
    }

    // Function to send data to background script
    async function sendToSheet(mangaData) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'updateSheet',
          data: mangaData
        });
        
        if (response.success) {
          console.log('[Mangago Tracker] Successfully updated sheet:', mangaData.title);
        } else {
          console.error('[Mangago Tracker] Failed to update sheet:', response.error);
        }
      } catch (error) {
        console.error('[Mangago Tracker] Error sending message:', error);
      }
    }

    // Monitor clicks on list buttons
    function attachListeners() {
      // Target the list action buttons
      const listButtons = document.querySelectorAll('.list_category a, .bookmark-btn, [class*="list"], [class*="bookmark"]');
      
      listButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          setTimeout(() => {
            const buttonText = this.textContent.trim().toLowerCase();
            let status = null;

            if (buttonText.includes('want to read') || buttonText.includes('plan to read')) {
              status = 'Want to Read';
            } else if (buttonText.includes('reading') || buttonText.includes('currently reading')) {
              status = 'Reading';
            } else if (buttonText.includes('completed') || buttonText.includes('finished')) {
              status = 'Completed';
            }

            if (status) {
              const mangaInfo = getMangaInfo();
              if (mangaInfo.title) {
                const data = {
                  title: mangaInfo.title,
                  status: status,
                  lastChapter: mangaInfo.lastChapter || 'N/A',
                  url: mangaInfo.url,
                  timestamp: new Date().toISOString()
                };
                
                console.log('[Mangago Tracker] Detected list action:', data);
                sendToSheet(data);
              }
            }
          }, 500);
        });
      });
    }

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      attachListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial attachment
    attachListeners();

    // Also listen for direct button interactions (alternative method)
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const onclick = target.getAttribute('onclick') || '';
      const className = target.className || '';
      
      // Detect list actions from hrefs, onclick handlers, or classes
      let status = null;
      const combinedText = (target.textContent + href + onclick + className).toLowerCase();

      if (combinedText.includes('want') || combinedText.includes('plan')) {
        status = 'Want to Read';
      } else if (combinedText.includes('reading') && !combinedText.includes('completed')) {
        status = 'Reading';
      } else if (combinedText.includes('completed') || combinedText.includes('finished')) {
        status = 'Completed';
      }

      if (status) {
        setTimeout(() => {
          const mangaInfo = getMangaInfo();
          if (mangaInfo.title) {
            const data = {
              title: mangaInfo.title,
              status: status,
              lastChapter: mangaInfo.lastChapter || 'N/A',
              url: mangaInfo.url,
              timestamp: new Date().toISOString()
            };
            
            console.log('[Mangago Tracker] Captured list action:', data);
            sendToSheet(data);
          }
        }, 500);
      }
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeMangaLists);
  } else {
    observeMangaLists();
  }
})();