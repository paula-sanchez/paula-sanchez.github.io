// CARGAR Y FILTRAR PUBLICACIONES (Últimas 10)
(function () {
  function getProfileAuthor() {
    return window.PROFILE_CONFIG?.searchName || '';
  }

  function buildProfilePublicationHtml(pub) {
    const borderAndBadgeClasses = window.PublicationsLoader.getTypeClasses(pub.type);
    const titleLink = pub.url || (pub.doi ? (pub.doi.startsWith('http') ? pub.doi : 'https://doi.org/' + pub.doi) : null);

    return `
      <div class="p-5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-brand-200 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="sm:w-24 flex-shrink-0">
            <span class="block text-xl font-bold text-gray-400">${pub.year}</span>
            <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold ${borderAndBadgeClasses.badgeText} ${borderAndBadgeClasses.badgeBg} rounded uppercase">
              ${pub.badge}
            </span>
          </div>

          <div class="flex-grow">
            <h3 class="text-base font-bold text-gray-900 leading-snug">
              ${titleLink
                ? `<a href="${titleLink}" target="_blank" rel="noopener noreferrer" class="hover:underline text-brand-600">${pub.title}</a>`
                : pub.title}
            </h3>
            <p class="text-sm text-gray-600 mt-2">${pub.authorsDisplay}</p>
            <p class="text-sm text-gray-500 italic mt-1 font-serif">${pub.venue}</p>

            ${pub.doi || pub.url ? `
            <div class="mt-3 flex gap-3">
              ${pub.doi ? `<a href="${pub.doi.startsWith('http') ? pub.doi : 'https://doi.org/' + pub.doi}" target="_blank" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-link mr-1"></i>DOI</a>` : ''}
              ${pub.url ? `<a href="${pub.url}" target="_blank" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-file-pdf mr-1"></i>URL / PDF</a>` : ''}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  async function loadProfilePublications() {
    const container = document.getElementById('publications-list');
    if (!container) {
      return;
    }

    const authorToSearch = getProfileAuthor();
    if (!window.PublicationsLoader || typeof window.PublicationsLoader.loadPublications !== 'function') {
      console.error('PublicationsLoader is not available.');
      container.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return;
    }

    await window.PublicationsLoader.loadPublications({
      container,
      publicationsPath: '/publications.json',
      filter: (pub) => {
        const isJournalOrConference = pub.type === 'journal' || pub.type === 'conference';
        const isAuthor = String(pub.authorsDisplay || '').includes(authorToSearch) || String(pub.authorsData || '').includes(authorToSearch);
        return isJournalOrConference && isAuthor;
      },
      sort: (a, b) => b.year - a.year,
      limit: 5,
      renderer: buildProfilePublicationHtml,
      emptyMessage: '<p class="text-gray-500 italic">No recent journal publications found.</p>'
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-all-btn');
    const detailsElements = document.querySelectorAll('main details');
    let allExpanded = false;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        allExpanded = !allExpanded;

        detailsElements.forEach(detail => {
          if (allExpanded) {
            detail.setAttribute('open', '');
          } else {
            detail.removeAttribute('open');
          }
        });

        if (allExpanded) {
          toggleBtn.innerHTML = '<i class="fa-solid fa-angles-up"></i><span>Collapse All</span>';
        } else {
          toggleBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i><span>Expand All</span>';
        }
      });
    }

    loadProfilePublications();
  });
})();