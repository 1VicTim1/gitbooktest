// Переключение темы
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Загрузка и отображение ROMs
async function loadROMs() {
  try {
    const response = await fetch('data/roms.json');
    const data = await response.json();
    displayROMs(data);
  } catch (error) {
    console.error('Ошибка загрузки ROMs:', error);
    document.getElementById('romsContainer').innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Не удалось загрузить список прошивок</p>
      </div>
    `;
  }
}

function displayROMs(data) {
  const container = document.getElementById('romsContainer');
  const roms = data.roms;
  
  // Группируем по Android версии
  const groupedByAndroid = roms.reduce((acc, rom) => {
    const android = rom.android;
    if (!acc[android]) acc[android] = [];
    acc[android].push(rom);
    return acc;
  }, {});
  
  let html = '<h2><i class="fas fa-download"></i> Доступные прошивки</h2>';
  
  // Сортируем Android версии по убыванию
  const androidVersions = Object.keys(groupedByAndroid).sort((a, b) => b - a);
  
  androidVersions.forEach(androidVersion => {
    const romsForAndroid = groupedByAndroid[androidVersion];
    
    html += `
      <div class="android-version" data-android="${androidVersion}">
        <div class="android-header" onclick="toggleSection(this)">
          <h3>
            <i class="fab fa-android"></i>
            Android ${androidVersion}
            <span class="rom-count">${romsForAndroid.length} прошивок</span>
          </h3>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="android-content">
          ${romsForAndroid.map(rom => renderRomFamily(rom)).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  initAccordions();
}

function renderRomFamily(rom) {
  return `
    <div class="rom-family">
      <div class="family-header" onclick="toggleSection(this)">
        <h4>
          <i class="fas fa-folder"></i>
          ${rom.family}
          <span class="version-count">${rom.versions.length} версий</span>
        </h4>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="family-content">
        ${rom.versions.map(version => renderRomVersion(version)).join('')}
      </div>
    </div>
  `;
}

function renderRomVersion(version) {
  return `
    <div class="rom-version">
      <div class="version-header">
        <h5>
          <i class="fas fa-code-branch"></i>
          ${version.name}
        </h5>
        ${version.date ? `<span class="version-date">${version.date}</span>` : ''}
      </div>
      
      ${version.variants ? version.variants.map(variant => `
        <div class="variant">
          <small>${variant.type}</small>
          <div class="download-links">
            ${variant.links.map(link => `
              <a href="${link.url}" target="_blank" class="download-btn">
                <i class="fas fa-download"></i>
                ${link.name}
              </a>
            `).join('')}
          </div>
        </div>
      `).join('') : ''}
      
      ${version.links ? `
        <div class="download-links">
          ${version.links.map(link => `
            <a href="${link.url}" target="_blank" class="download-btn">
              <i class="fas fa-download"></i>
              ${link.name}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Аккордеон
function toggleSection(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('i.fa-chevron-down, i.fa-chevron-up');
  
  if (content.style.display === 'block') {
    content.style.display = 'none';
    icon.className = 'fas fa-chevron-down';
  } else {
    content.style.display = 'block';
    icon.className = 'fas fa-chevron-up';
  }
}

function initAccordions() {
  document.querySelectorAll('.android-content, .family-content').forEach(content => {
    content.style.display = 'none';
  });
}

// Фильтрация
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Убираем активный класс у всех кнопок
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Добавляем активный класс нажатой кнопке
      button.classList.add('active');
      
      const filter = button.dataset.filter;
      filterROMs(filter);
    });
  });
}

function filterROMs(androidVersion) {
  const roms = document.querySelectorAll('.android-version');
  
  roms.forEach(rom => {
    if (androidVersion === 'all' || rom.dataset.android === androidVersion) {
      rom.style.display = 'block';
    } else {
      rom.style.display = 'none';
    }
  });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadROMs();
  initFilters();
});
