// publications.js

(function () {
  const DEFAULT_PUBLICATIONS_PATH = '/publications.json';

  function getTypeClasses(type) {
    if (type === 'journal') {
      return {
        border: 'border-green-600',
        badgeText: 'text-green-700',
        badgeBg: 'bg-green-100'
      };
    }

    if (type === 'conference') {
      return {
        border: 'border-blue-500',
        badgeText: 'text-blue-700',
        badgeBg: 'bg-blue-100'
      };
    }

    if (type === 'workshop') {
      return {
        border: 'border-orange-500',
        badgeText: 'text-orange-700',
        badgeBg: 'bg-orange-100'
      };
    }

    return {
      border: 'border-brand-600',
      badgeText: 'text-brand-700',
      badgeBg: 'bg-brand-100'
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getContainer(containerOrId) {
    if (!containerOrId) {
      return null;
    }

    return typeof containerOrId === 'string'
      ? document.getElementById(containerOrId)
      : containerOrId;
  }

  function renderPublication(pub) {
    const borderAndBadgeClasses = getTypeClasses(pub.type);
    const hasBibtex = !!pub.bibtex;
    const bibtexViewUrl = hasBibtex ? `data:text/plain;charset=utf-8,${encodeURIComponent(pub.bibtex)}` : null;

    return `
      <div class="pub-item flex flex-col sm:flex-row gap-4 p-6 rounded-lg border-l-4 ${borderAndBadgeClasses.border} bg-white shadow-sm hover:shadow-md transition"
          data-year="${pub.year}"
          data-type="${pub.type}"
          data-authors="${pub.authorsData}">
        <div class="sm:w-32 flex-shrink-0 text-left sm:text-right">
          <span class="block text-2xl font-bold text-gray-400">${pub.year}</span>
          <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold ${borderAndBadgeClasses.badgeText} ${borderAndBadgeClasses.badgeBg} rounded uppercase">
            ${pub.badge}
          </span>
        </div>
        <div class="flex-grow">
          <h3 class="text-lg font-bold text-gray-900 leading-snug">
            ${pub.title}
          </h3>
          <p class="text-gray-700 mt-2 text-sm leading-relaxed">
            ${pub.authorsDisplay}
          </p>
          <p class="text-sm text-gray-500 italic mt-1 border-t border-gray-100 pt-2 inline-block">
            ${pub.venue}
          </p>
          ${hasBibtex ? `
            <div class="mt-4 flex gap-2 flex-wrap">
              <a
                href="${bibtexViewUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs flex items-center px-3 py-1 border border-gray-200 rounded text-gray-500 hover:text-brand-600 hover:border-brand-600 transition"
              >
                <i class="fa-solid fa-quote-right mr-2"></i>BibTeX
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  async function loadPublications(options = {}) {
    const {
      container = 'publicationsList',
      publicationsPath = DEFAULT_PUBLICATIONS_PATH,
      filter = () => true,
      sort = (a, b) => b.year - a.year,
      limit = null,
      renderer = null,
      emptyMessage = '',
      onComplete = null
    } = options;

    const containerElement = getContainer(container);
    if (!containerElement) {
      console.error('No element with id="publicationsList" found.');
      return [];
    }

    try {
      const response = await fetch(publicationsPath);
      if (!response.ok) {
        throw new Error(`Error loading ${publicationsPath}`);
      }

      const publications = await response.json();
      const filteredPublications = publications.filter(filter);
      filteredPublications.sort(sort);
      const itemsToRender = limit === null ? filteredPublications : filteredPublications.slice(0, limit);

      containerElement.innerHTML = '';

      if (itemsToRender.length === 0) {
        if (emptyMessage) {
          containerElement.innerHTML = emptyMessage;
        }

        if (onComplete) {
          onComplete([]);
        }

        return itemsToRender;
      }

      itemsToRender.forEach(pub => {
        const html = renderer ? renderer(pub) : renderPublication(pub);
        containerElement.insertAdjacentHTML('beforeend', html);
      });

      if (onComplete) {
        onComplete(itemsToRender);
      }

      if (window.initPublicationFilters) {
        window.initPublicationFilters();
      }

      return itemsToRender;
    } catch (err) {
      console.error(err);
      containerElement.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return [];
    }
  }

  const PublicationsLoader = {
    getTypeClasses,
    escapeHtml,
    renderPublication,
    loadPublications
  };

  window.PublicationsLoader = PublicationsLoader;
  window.loadPublications = loadPublications;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('publicationsList')) {
        loadPublications();
      }
    });
  } else if (document.getElementById('publicationsList')) {
    loadPublications();
  }
})();