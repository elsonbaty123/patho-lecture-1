// DOM Elements - will be initialized when DOM is ready
let darkModeToggle, searchToggle, searchBar, searchInput, clearSearch, navList;

// This initialization is now handled by the consolidated initializeAll function

// Navigation Generation
function initializeNavigation() {
    const sections = document.querySelectorAll('.section');
    const navItems = [];

    sections.forEach(section => {
        const id = section.id;
        const heading = section.querySelector('h2');
        if (heading) {
            const title = heading.textContent;
            const icon = heading.querySelector('i')?.className || 'fas fa-circle';
            
            navItems.push({
                id,
                title,
                icon
            });
        }
    });

    // Generate navigation HTML
    navList.innerHTML = navItems.map(item => `
        <li class="nav-item">
            <a href="#${item.id}" class="nav-link" data-section="${item.id}">
                <i class="${item.icon}"></i>
                ${item.title}
            </a>
        </li>
    `).join('');

    // Add click event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Dark Mode Functionality
function initializeDarkMode() {
    if (!darkModeToggle) {
        console.error('Dark mode toggle element not found');
        return;
    }
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Initializing theme:', savedTheme);
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateDarkModeIcon(savedTheme);

    // Add click event listener
    darkModeToggle.addEventListener('click', function() {
        console.log('Dark mode toggle clicked');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Switching from', currentTheme, 'to', newTheme);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateDarkModeIcon(newTheme);
    });
}

function updateDarkModeIcon(theme) {
    const icon = darkModeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Search Functionality
function initializeSearch() {
    if (!searchToggle || !searchBar || !searchInput || !clearSearch) {
        console.error('Search elements not found');
        return;
    }
    
    console.log('Initializing search functionality');
    
    searchToggle.addEventListener('click', function() {
        console.log('Search toggle clicked');
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            clearHighlights();
        }
    });

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        console.log('Search input:', query);
        if (query) {
            performSearch(query);
        } else {
            clearHighlights();
        }
    });

    clearSearch.addEventListener('click', function() {
        console.log('Clear search clicked');
        searchInput.value = '';
        clearHighlights();
        searchBar.classList.remove('active');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            console.log('Ctrl+K pressed - opening search');
            searchBar.classList.add('active');
            searchInput.focus();
        }
        if (e.key === 'Escape' && searchBar.classList.contains('active')) {
            console.log('Escape pressed - closing search');
            searchBar.classList.remove('active');
            searchInput.value = '';
            clearHighlights();
        }
    });
}

function performSearch(query) {
    if (query.length < 2) {
        clearHighlights();
        return;
    }

    const sections = document.querySelectorAll('.section');
    let hasResults = false;

    sections.forEach(section => {
        const content = section.textContent.toLowerCase();
        const matches = content.includes(query.toLowerCase());
        
        if (matches) {
            section.style.display = 'block';
            highlightSearchTerms(section, query);
            hasResults = true;
        } else {
            section.style.display = 'none';
        }
    });

    if (!hasResults) {
        showNoResults();
    } else {
        removeNoResults();
    }
}

function highlightSearchTerms(section, query) {
    // Remove existing highlights
    section.querySelectorAll('.search-highlight').forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });

    // Add new highlights
    const walker = document.createTreeWalker(
        section,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedHTML;
            textNode.parentNode.replaceChild(wrapper, textNode);
        }
    });
}

function clearHighlights() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'block';
        
        // Remove highlights
        section.querySelectorAll('.search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    });

    // Remove no results message
    removeNoResults();
}

function showNoResults() {
    removeNoResults(); // Remove any existing message first
    
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div class="content-card" style="text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No results found</h3>
                <p>Try searching with different keywords or check your spelling.</p>
            </div>
        `;
        contentWrapper.appendChild(noResults);
    }
}

function removeNoResults() {
    const existingMessage = document.querySelector('.no-results');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Active Section Highlighting
function initializeActiveSection() {
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            const navLink = document.querySelector(`[data-section="${entry.target.id}"]`);
            if (navLink) {
                if (entry.isIntersecting) {
                    // Remove active class from all nav links
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    // Add active class to current nav link
                    navLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for search highlights
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: #fef08a;
        color: #854d0e;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-weight: 500;
    }
    
    [data-theme="dark"] .search-highlight {
        background-color: #fbbf24;
        color: #1f2937;
    }
    
    .no-results {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(1rem);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchBar.classList.remove('hidden');
        searchInput.focus();
    }
    
    // Ctrl/Cmd + D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        darkModeToggle.click();
    }
});

// Print functionality
function printPage() {
    window.print();
}

// Export functionality (if needed in the future)
function exportToHTML() {
    const content = document.documentElement.outerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pathology-lecture-notes.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Performance optimization: Lazy loading for images (if any are added later)
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Lazy loading is now handled by the consolidated initializeAll function

// Additional functionality for enhanced user experience

// Smooth scrolling with offset for fixed header
function smoothScrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        const headerHeight = 80; // Height of fixed header
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Enhanced search with section highlighting
function highlightSection(sectionId) {
    // Remove existing highlights
    document.querySelectorAll('.section-highlighted').forEach(el => {
        el.classList.remove('section-highlighted');
    });
    
    // Add highlight to target section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('section-highlighted');
        setTimeout(() => {
            section.classList.remove('section-highlighted');
        }, 3000);
    }
}

// Table of contents generator for complex sections
function generateTableOfContents() {
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.innerHTML = '<h3><i class="fas fa-list"></i> Quick Navigation</h3>';
    
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    // Find all major headings
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach((heading, index) => {
        const id = heading.closest('.section')?.id || `heading-${index}`;
        const text = heading.textContent;
        const level = heading.tagName.toLowerCase();
        
        const listItem = document.createElement('li');
        listItem.className = `toc-item toc-${level}`;
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = text;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollToSection(id);
            highlightSection(id);
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    tocContainer.appendChild(tocList);
    return tocContainer;
}

// Progress indicator
function initializeProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-indicator';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    document.body.appendChild(progressBar);
    
    const progressFill = progressBar.querySelector('.progress-fill');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
}

// Section completion tracking
function initializeSectionTracking() {
    const sections = document.querySelectorAll('.section');
    const completedSections = new Set();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                completedSections.add(entry.target.id);
                updateProgressStats();
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => observer.observe(section));
    
    function updateProgressStats() {
        const totalSections = sections.length;
        const completedCount = completedSections.size;
        const percentage = Math.round((completedCount / totalSections) * 100);
        
        // Update progress in header if element exists
        const progressElement = document.querySelector('.reading-progress');
        if (progressElement) {
            progressElement.textContent = `${completedCount}/${totalSections} sections (${percentage}%)`;
        }
    }
}

// Enhanced navigation with breadcrumbs
function initializeBreadcrumbs() {
    const breadcrumbContainer = document.createElement('div');
    breadcrumbContainer.className = 'breadcrumb-container';
    breadcrumbContainer.innerHTML = `
        <nav class="breadcrumb">
            <span class="breadcrumb-item active">
                <i class="fas fa-home"></i> Pathology Lecture
            </span>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-current">Introduction</span>
        </nav>
    `;
    
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(breadcrumbContainer);
    }
    
    // Update breadcrumb based on current section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionTitle = entry.target.querySelector('h2')?.textContent || 'Section';
                const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
                if (breadcrumbCurrent) {
                    breadcrumbCurrent.textContent = sectionTitle;
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    });
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// Print preparation
function preparePrintVersion() {
    // Add print-specific styles and content
    const printStyles = document.createElement('style');
    printStyles.setAttribute('media', 'print');
    printStyles.textContent = `
        @page {
            margin: 1in;
            size: A4;
        }
        
        .section {
            page-break-inside: avoid;
            margin-bottom: 2rem;
        }
        
        .section-header h2 {
            color: #000 !important;
            border-bottom: 2px solid #000;
            padding-bottom: 0.5rem;
        }
        
        .content-card {
            border: 1px solid #ccc;
            box-shadow: none;
        }
        
        .highlight-box,
        .definition-box {
            border: 2px solid #000;
            background: #f9f9f9 !important;
        }
    `;
    document.head.appendChild(printStyles);
}

// Accessibility enhancements
function initializeAccessibility() {
    // Add skip navigation link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ARIA labels to navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        link.setAttribute('aria-label', `Navigate to ${text} section`);
    });
    
    // Add keyboard navigation for cards
    const cards = document.querySelectorAll('.content-card, .type-card, .condition-card');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
            }
        });
    });
}

// Enhanced tooltip system
function initializeTooltips() {
    // Add tooltips for medical terms
    const medicalTerms = {
        'hyperemia': 'Increased blood flow to a tissue or organ',
        'edema': 'Swelling caused by excess fluid trapped in body tissues',
        'necrosis': 'Death of cells or tissue through disease or injury',
        'granuloma': 'A structure formed during inflammation found in many diseases',
        'epithelioid': 'Cells resembling epithelial cells, typically found in granulomas',
        'pyogranuloma': 'A granuloma containing neutrophils (pus cells)',
        'tympany': 'Distension of the stomach with gas',
        'eructation': 'The act of belching or burping'
    };
    
    Object.keys(medicalTerms).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (regex.test(node.textContent)) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            const html = textNode.textContent.replace(regex, 
                `<span class="medical-term" data-tooltip="${medicalTerms[term]}">$&</span>`
            );
            const wrapper = document.createElement('span');
            wrapper.innerHTML = html;
            parent.replaceChild(wrapper, textNode);
        });
    });
    
    // Add tooltip functionality
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('medical-term')) {
            showTooltip(e.target, e.target.dataset.tooltip);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('medical-term')) {
            hideTooltip();
        }
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    
    setTimeout(() => tooltip.classList.add('visible'), 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Fix the duplicate DOMContentLoaded listener issue
// Remove the duplicate and consolidate initialization

// Initialize all features when DOM is ready
function initializeAll() {
    // Initialize DOM elements first
    darkModeToggle = document.getElementById('darkModeToggle');
    searchToggle = document.getElementById('searchToggle');
    searchBar = document.getElementById('searchBar');
    searchInput = document.getElementById('searchInput');
    clearSearch = document.getElementById('clearSearch');
    navList = document.getElementById('navList');
    
    // Check if required elements exist
    if (!darkModeToggle || !searchToggle || !searchBar || !searchInput || !clearSearch || !navList) {
        console.error('Some required DOM elements are missing');
        return;
    }
    
    // Core functionality
    initializeNavigation();
    initializeDarkMode();
    initializeSearch();
    initializeSmoothScrolling();
    initializeActiveSection();
    initializeLazyLoading();
    
    // Enhanced features
    initializeProgressIndicator();
    initializeSectionTracking();
    initializeBreadcrumbs();
    preparePrintVersion();
    initializeAccessibility();
    initializeTooltips();
    
    // Add reading progress to header
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
        const progressElement = document.createElement('div');
        progressElement.className = 'reading-progress';
        progressElement.textContent = '0/0 sections (0%)';
        headerContent.appendChild(progressElement);
    }
}

// Single DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', initializeAll);

// Export functions for potential external use
window.PathologyLecture = {
    smoothScrollToSection,
    highlightSection,
    generateTableOfContents,
    printPage,
    exportToHTML
};
