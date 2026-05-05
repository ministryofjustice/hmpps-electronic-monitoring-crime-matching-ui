const URLS = {
  HUB_MANAGERS: {
    VIEW: '/hub-managers' as const,
    CREATE: '/hub-managers/create' as const,
    DELETE: '/hub-managers/:id/delete' as const,
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
}

export default URLS
