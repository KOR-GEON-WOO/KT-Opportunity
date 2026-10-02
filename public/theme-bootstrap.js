// Runs before React/CSS; shared rules prevent a different first-paint theme.
;(function () {
  const key = 'kt-opportunity.theme.v1'
  const valid = value => ['light', 'dark', 'system'].includes(value) ? value : 'system'
  let media
  try { media = window.matchMedia('(prefers-color-scheme: dark)') } catch { /* light fallback */ }
  let preference = 'system'
  try { preference = valid(localStorage.getItem(key)) } catch { /* session-only preference */ }
  function apply() {
    document.documentElement.dataset.theme = preference === 'system' ? media?.matches ? 'dark' : 'light' : preference
    document.documentElement.dataset.themePreference = preference
  }
  function notify() { apply(); window.dispatchEvent(new Event('kt-theme-change')) }
  window.ktTheme = {
    get: () => preference,
    set: value => { preference = valid(value); try { localStorage.setItem(key, preference) } catch { /* keep session state */ } notify() },
  }
  media?.addEventListener('change', notify)
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { preference = valid(event.newValue); notify() } })
  apply()
})()
