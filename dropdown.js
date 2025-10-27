// Dropdown functionality for chat modes
(function() {
  'use strict';
  
  console.log('Loading dropdown functionality...');

  function initializeDropdown() {
    console.log('Initializing dropdown functionality...');
    
    const dropdownToggle = document.getElementById('modeDropdownToggle');
    const dropdownMenu = document.getElementById('modeDropdownMenu');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    if (!dropdownToggle) {
      console.error('Dropdown toggle not found!');
      return;
    }

    if (!dropdownMenu) {
      console.error('Dropdown menu not found!');
      return;
    }

    if (dropdownItems.length === 0) {
      console.error('No dropdown items found!');
      return;
    }

    console.log('Dropdown elements found:', {
      toggle: !!dropdownToggle,
      menu: !!dropdownMenu,
      items: dropdownItems.length
    });

    // Toggle dropdown
    dropdownToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
      console.log('Dropdown toggle clicked, expanding:', !isExpanded);
      toggleDropdown(!isExpanded);
    });

    // Handle dropdown item selection
    dropdownItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        const mode = item.dataset.mode;
        console.log('Mode selected:', mode);
        selectMode(mode);
        toggleDropdown(false);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    // Handle keyboard navigation
    dropdownToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        toggleDropdown(true);
        focusFirstDropdownItem();
      }
    });

    dropdownMenu.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        toggleDropdown(false);
        dropdownToggle.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusNextDropdownItem(e.target);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusPreviousDropdownItem(e.target);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    });

    function toggleDropdown(show) {
      console.log('Toggling dropdown:', show);
      dropdownToggle.setAttribute('aria-expanded', show.toString());
      
      if (show) {
        dropdownMenu.classList.add('show');
        console.log('Dropdown opened');
      } else {
        dropdownMenu.classList.remove('show');
        console.log('Dropdown closed');
      }
    }

    function selectMode(mode) {
      const currentModeText = document.querySelector('.current-mode-text');
      
      // Update current mode display
      const modeLabels = {
        'chat': '💬 Chat',
        'mindmap': '🧠 Mind Map',
        'roadmap': '🗺️ Roadmap',
        'flashcard': '🃏 Cards',
        'powerpoint': '📊 Slides'
      };

      const selectedLabel = modeLabels[mode] || '💬 Chat';

      if (currentModeText) {
        currentModeText.textContent = selectedLabel;
        console.log('Updated mode text to:', selectedLabel);
      }

      // Update active state
      dropdownItems.forEach(function(item) {
        item.classList.toggle('active', item.dataset.mode === mode);
      });

      // Call existing switchMode function if it exists
      if (typeof window.switchMode === 'function') {
        window.switchMode(mode);
      } else if (typeof switchMode === 'function') {
        switchMode(mode);
      }

      console.log('Switched to ' + mode + ' mode');
    }

    function focusFirstDropdownItem() {
      const firstItem = dropdownMenu.querySelector('.dropdown-item');
      if (firstItem) {
        firstItem.focus();
      }
    }

    function focusNextDropdownItem(currentItem) {
      const items = Array.from(dropdownMenu.querySelectorAll('.dropdown-item'));
      const currentIndex = items.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex].focus();
    }

    function focusPreviousDropdownItem(currentItem) {
      const items = Array.from(dropdownMenu.querySelectorAll('.dropdown-item'));
      const currentIndex = items.indexOf(currentItem);
      const previousIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      items[previousIndex].focus();
    }

    console.log('Dropdown functionality initialized successfully!');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDropdown);
  } else {
    // DOM is already ready
    initializeDropdown();
  }

})();