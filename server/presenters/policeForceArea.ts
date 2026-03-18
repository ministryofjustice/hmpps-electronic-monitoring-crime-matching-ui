import { withFallback } from './helpers/formatters'

const policeForceAreaMap: Record<string, string> = {
  AVON_AND_SOMERSET: 'Avon and Somerset',
  BEDFORDSHIRE: 'Bedfordshire',
  CHESHIRE: 'Cheshire',
  CITY_OF_LONDON: 'City of London',
  CUMBRIA: 'Cumbria',
  DERBYSHIRE: 'Derbyshire',
  DURHAM: 'Durham',
  ESSEX: 'Essex',
  GLOUCESTERSHIRE: 'Gloucestershire',
  GWENT: 'Gwent',
  HAMPSHIRE: 'Hampshire',
  HERTFORDSHIRE: 'Hertfordshire',
  HUMBERSIDE: 'Humberside',
  KENT: 'Kent',
  METROPOLITAN: 'Metropolitan',
  NORTH_WALES: 'North Wales',
  NOTTINGHAMSHIRE: 'Nottinghamshire',
  SUSSEX: 'Sussex',
  WEST_MIDLANDS: 'West Midlands',
}

const presentPoliceForceArea = (policeForceArea: string): string => {
  return withFallback(policeForceAreaMap[policeForceArea])
}

export default presentPoliceForceArea
