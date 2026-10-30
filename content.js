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

    // Mangago's list buttons call newStatus('<slug>', N): 1 = Want to read, 2 = Now reading, 3 = Already read
    const STATUS_BY_CODE = {
      '1': 'Want to Read',
      '2': 'Reading',
      '3': 'Already Read'
    };

    // Fallback for buttons without a recognisable onclick, matched on their visible label
    function statusFromLabel(text) {
      if (/want to read|plan to read/.test(text)) return 'Want to Read';
      if (/now reading|currently reading/.test(text)) return 'Reading';
      if (/already read|completed|finished/.test(text)) return 'Already Read';
      return null;
    }

    // One delegated listener, so each click is reported exactly once
    document.addEventListener('click', function(e) {
      const button = e.target.closest('a.collect_btn, [onclick*="newStatus"]');
      if (!button) return;

      const code = (button.getAttribute('onclick') || '').match(/newStatus\(\s*['"][^'"]*['"]\s*,\s*(\d)/);
      const label = button.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      const status = (code && STATUS_BY_CODE[code[1]]) || statusFromLabel(label);
      if (!status) return;

      setTimeout(() => {
        const mangaInfo = getMangaInfo();
        if (!mangaInfo.title) return;

        const data = {
          title: mangaInfo.title,
          status: status,
          lastChapter: mangaInfo.lastChapter || 'N/A',
          url: mangaInfo.url,
          timestamp: new Date().toISOString()
        };

        console.log('[Mangago Tracker] Captured list action:', data);
        sendToSheet(data);
      }, 500);
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeMangaLists);
  } else {
    observeMangaLists();
  }
})();