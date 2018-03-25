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
      theme[input.getAttribute("id")] = input.value;
    }
    return theme;
  }
  return themes[themeName];
}

function save(event) {
  let themeName = document.getElementById("theme").value;
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
        input.value = selectedTheme[input.getAttribute("id")];
      }
      selectedTheme = null;
    }
  }
  else{
    document.getElementById('custom').style.display = 'none'; 
    selectedTheme = themes[theme];
  }
}

function restoreOptions(){
  var gettingItem = browser.storage.sync.get(['themeName', 'theme']);
  gettingItem.then((res) => {
    document.querySelector("#theme").value = res.themeName || 'default';
    if(res.themeName == 'custom'){
      let inputs = document.querySelectorAll('#custom  input');
      for (var input of inputs) {
        input.value = theme[input.getAttribute("id")];
      }
      document.getElementById('custom').style.display = 'block'; 
    }
  });
}

function start() {
  document.getElementById("form").addEventListener('submit', save);
  document.getElementById('theme').addEventListener('change', toggleCustomColors);
  restoreOptions();
}
document.addEventListener('DOMContentLoaded', start);
