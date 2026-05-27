import { HomepageFeature } from '../types/homepage'

const presentFeature = (feature: HomepageFeature) => ({
  id: feature.id,
  href: feature.href,
  heading: feature.heading,
  description: feature.description,
})

const presentHomepageFeatures = (features: Array<HomepageFeature>) => {
  return {
    admin: features.filter(feature => feature.section === 'admin').map(presentFeature),
    caseworker: features.filter(feature => feature.section === 'caseworker').map(presentFeature),
  }
}

export default presentHomepageFeatures
