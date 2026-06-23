const URLS = {
  HUB_MANAGERS: {
    VIEW: '/hub-managers' as const,
    CREATE: '/hub-managers/create' as const,
    DELETE: '/hub-managers/:id/delete' as const,
  },
  LOCATION_DATA: {
    DEVICE_ACTIVATION: {
      VIEW: '/location-data/device-activations/:deviceActivationId' as const,
    },
    DEVICE_ACTIVATIONS: {
      VIEW: '/location-data/persons' as const,
    },
  },
  POLICE_DATA: {
    INGESTION_ATTEMPT: {
      VIEW: '/police-data/ingestion-attempts/:ingestionAttemptId' as const,
      EXPORT_VALIDATION_ERRORS: '/police-data/ingestion-attempts/:ingestionAttemptId/export' as const,
    },
    INGESTION_ATTEMPTS: {
      VIEW: '/police-data/dashboard' as const,
      EXPORT_MATCHING_RESULTS: '/police-data/dashboard/export' as const,
    },
  },
  PROXIMITY_ALERT: {
    CRIME_VERSION: {
      VIEW: '/proximity-alert/:crimeVersionId' as const,
      EXPORT: '/proximity-alert/:crimeVersionId/export-proximity-alert' as const,
    },
    CRIME_VERSIONS: {
      VIEW: '/proximity-alert' as const,
    },
  },
}

export default URLS
