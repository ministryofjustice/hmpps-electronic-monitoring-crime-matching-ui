const policeForceAreas: Map<string, string> = new Map([
  ['AVON_AND_SOMERSET', 'Avon and Somerset'],
  ['BEDFORDSHIRE', 'Bedfordshire'],
  ['CHESHIRE', 'Cheshire'],
  ['CITY_OF_LONDON', 'City of London'],
  ['CUMBRIA', 'Cumbria'],
  ['DERBYSHIRE', 'Derbyshire'],
  ['DURHAM', 'Durham'],
  ['ESSEX', 'Essex'],
  ['GLOUCESTERSHIRE', 'Gloucestershire'],
  ['GWENT', 'Gwent'],
  ['HAMPSHIRE', 'Hampshire'],
  ['HERTFORDSHIRE', 'Hertfordshire'],
  ['HUMBERSIDE', 'Humberside'],
  ['KENT', 'Kent'],
  ['METROPOLITAN', 'Metropolitan'],
  ['NORTH_WALES', 'North Wales'],
  ['NOTTINGHAMSHIRE', 'Nottinghamshire'],
  ['SUSSEX', 'Sussex'],
  ['WEST_MIDLANDS', 'West Midlands'],
])

// Police force areas formatted as govuk select items
// https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/select/select.yaml#L10
const policeForceAreaOptions = [
  {
    value: '',
    text: '',
  },
  ...policeForceAreas.keys().map(key => ({
    value: key,
    text: policeForceAreas.get(key) || '',
  })),
]

export { policeForceAreas, policeForceAreaOptions }
