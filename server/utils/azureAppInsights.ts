import { flushTelemetry, initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

initialiseTelemetry({
  serviceName: 'hmpps-electronic-monitoring-crime-matching-ui',
  serviceVersion: process.env.BUILD_NUMBER || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true', // Log telemetry to the console for debugging/developing
})
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/assets/*', '/favicon.ico']))
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

export default async function shutdownTelemetry(): Promise<void> {
  await flushTelemetry()
}
