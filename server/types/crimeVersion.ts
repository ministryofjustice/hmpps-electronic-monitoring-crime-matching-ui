type CrimeVersion = {
    crimeVersionId: string
    crimeReference: string
    crimeType: string
    crimeDateTimeFrom: string
    crimeDateTimeTo: string
    crimeText: string
    matching: Matching | null
}

type Matching = {
    deviceWearers: Array<{ 
        name: string
        deviceId: number
        nomisId: string
        positions: Array<{
            latitude: number
            longitude: number
            sequenceLabel: string
            confidence: number
            captureDateTime: string
        }>
    }>
}

export default CrimeVersion
