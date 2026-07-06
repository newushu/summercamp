export const LUNCH_ITEM_OPTIONS = [
  { value: 'hamburger', label: 'Hamburger' },
  { value: 'cheeseburger', label: 'Cheeseburger' },
  { value: 'california-roll', label: 'California Roll' },
]

export const LUNCH_ITEM_LABEL_BY_VALUE = Object.fromEntries(
  LUNCH_ITEM_OPTIONS.map((option) => [option.value, option.label])
)

export const LUNCH_FORM_DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function normalizeLunchDayKey(dayKey) {
  const value = String(dayKey || '').trim().toLowerCase()
  if (value.startsWith('mon')) return 'Mon'
  if (value.startsWith('tue')) return 'Tue'
  if (value.startsWith('wed')) return 'Wed'
  if (value.startsWith('thu')) return 'Thu'
  if (value.startsWith('fri')) return 'Fri'
  return String(dayKey || '').trim()
}

export function normalizeLunchItemValue(value) {
  if (value === true) return 'yes'
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return ''
  if (normalized === 'yes' || normalized === 'true') return 'yes'
  if (normalized === 'california roll') return 'california-roll'
  return LUNCH_ITEM_LABEL_BY_VALUE[normalized] ? normalized : normalized
}

export function getLunchItemLabel(value) {
  const normalized = normalizeLunchItemValue(value)
  if (!normalized) return ''
  if (normalized === 'yes') return 'Yes'
  return LUNCH_ITEM_LABEL_BY_VALUE[normalized] || String(value || '').trim()
}

export function isLunchItemSelected(value) {
  return Boolean(getLunchItemLabel(value))
}
