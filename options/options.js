const themes = {
  'default': {
    'main-bg-color': '#ececec',
    'search-bg-color': '#ffffff',
    'main-text-color': '#000000',
    'accent-bg-color': '#4A90D9',
    'accent-text-color': '#868686',
    'selected-text-color': '#ffffff'
  },
  'dark': {
    'main-bg-color': '#26272a',
    'search-bg-color': '#1f2022',
    'main-text-color': '#ececec',
    'accent-bg-color': '#006ed7',
    'accent-text-color': '#7b7b7d',
    'selected-text-color': '#f8fbfe'
  }
}

let selectedTheme = themes['default'];

function getTheme(themeName){
  if(themeName === 'custom') {
    let inputs = document.querySelectorAll('#custom  input');
    let theme = {};
    for (var input of inputs) {
      theme[input.getAttribute('id')] = input.value;
    }
    return theme;
  }
  return themes[themeName];
}

function save(event) {
  let themeName = document.getElementById('theme').value;
  let theme = getTheme(themeName);
  browser.storage.sync.set({
    theme: theme,
    themeName: themeName
  });
  event.preventDefault();
  return false;
}

function toggleCustomColors(event) {
  let theme = event.target.value;
  if(theme === 'custom'){
    document.getElementById('custom').style.display = 'block'; 
    if(selectedTheme){
      let inputs = document.querySelectorAll('#custom  input');
      for (var input of inputs) {
        input.value = selectedTheme[input.getAttribute('id')];
      }
      selectedTheme = null;
    }
  }
  else{
    document.getElementById('custom').style.display = 'none'; 
    selectedTheme = themes[theme];
  }
}

function doUpdatePreview(theme) {
  let preview = document.getElementById('preview');
  for (const key of Object.keys(theme)){
    preview.style.setProperty('--' + key, theme[key]);
  }
}
function updateLivePreview(event){
  let theme = getTheme(event.target.value);
  doUpdatePreview(theme);
}

function restoreOptions(){
  var gettingItem = browser.storage.sync.get(['themeName', 'theme']);
  gettingItem.then((res) => {
    let themeName = res.themeName || 'default'
    let theme = res.theme || themes['default'];
    document.querySelector('#theme').value = themeName;
    if(themeName == 'custom'){
      let inputs = document.querySelectorAll('#custom  input');
      for (var input of inputs) {
        input.value = theme[input.getAttribute('id')];
      }
      document.getElementById('custom').style.display = 'block'; 
    }
    doUpdatePreview(theme);
  });
}

function updatePreviewProperty(event){
  let input = event.target;
  let preview = document.getElementById('preview');
  preview.style.setProperty('--' + input.getAttribute('id'), input.value);
}

function start() {
  document.getElementById('form').addEventListener('submit', save);
  document.getElementById('theme').addEventListener('change', toggleCustomColors);
  document.getElementById('theme').addEventListener('change', updateLivePreview);
  for (const input of document.querySelectorAll('input[type=color]')) {
    input.addEventListener('change', updatePreviewProperty);
  }
  restoreOptions();
}
document.addEventListener('DOMContentLoaded', start);
