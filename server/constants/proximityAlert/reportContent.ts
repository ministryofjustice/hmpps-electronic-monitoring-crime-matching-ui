const PROXIMITY_ALERT_REPORT_CONTENT = {
  disclaimer: {
    heading: 'Disclaimer',
    paragraph1:
      "The data disclosed in this report does not confirm that the tag wearer perpetrated or witnessed a crime. In addition, it does not rule out other EM tag wearers being in the vicinity of the crime during the window of opportunity. The results of this process are also limited to persons tagged as part of the MoJ's Acquisitive Crime Project and only where there has been an ability to monitor the equipment during the window of opportunity of the crime.",
    paragraph2: 'Examples of an inability to monitor a person include:',
    bullets: [
      'Where the person has failed to charge the EM tag,',
      'Where the tag has been removed from the person but is still able to transmit its location,',
      'Where the equipment has failed due to a technical fault.',
    ],
    paragraph3:
      'The technology used (radio frequency transmissions; GPS location monitoring and Location Based Services) has been proven to be reliable over many years. The monitoring equipment is extremely robust and reliable and meets the stringent specifications laid down by the Ministry of Justice. The monitoring equipment is also rigorously tested and audited by EMS, an independent body, and the Home Office Scientific Branch.',
    osCopyrightText: 'All maps included in this document are subject to the following OS copyright (AC0000850671)',
  },

  exhibitMapKey: {
    heading: 'Exhibit EMAC/03 Key for interpreting symbols on the map',
    intro: 'The key below explains how to interpret the visual elements that appear in proximity alert images. ',
    note: 'Note: Not all visual elements demonstrated will be displayed in the proximity alert images; this will be determined as necessary.',
  },

  exhibitPositions: {
    heading: {
      prefix: 'Exhibit EMAC/04 - Table of ',
      suffix: 'locations within the vicinity',
    },
    description:
      'The below table displays the location points within the crime vicinity. Please note the sequence number is ordered chronologically based on locations within the vicinity.',
    note: "Note: Consecutive numbers do not necessarily indicate sequential movement - please review the time stamps of each point to understand the offender's movements.",
    columns: [
      'SEQUENCE NO.',
      'DATE/TIME',
      'LATITUDE (WGS84)',
      'LONGITUDE (WGS84)',
      'CONFIDENCE CIRCLE (Radius - m)',
      'SPEED (km/h)',
      'DIRECTION (degrees)',
    ],
  },

  summary: {
    dateLabel: 'Date',
    title: 'Acquisitive Crime Proximity Alert',
    crimeReferencePrefix: 'Crime Reference Number',
    heading: 'Summary',
    paragraph1:
      'The report below documents the results of a proximity search for the above crime reference number utilising the MoJ Acquisitive Crime Mapping Tool.',
    paragraph2:
      "This process is designed to identify persons who are tagged as part of the MoJ's Acquisitive Crime Project being in proximity of an acquisitive crime during the window of opportunity. The MoJ EM Acquisitive Crime Hub have reviewed each match and based on accuracy of the data and the relevance to the enquiry, have qualified the following as proximity match(es).",
  },

  resultSummary: {
    heading: 'Result Summary',
    matchedCountLabel: 'Number of qualified matches:',
  },

  requestSummary: {
    heading: 'Request Summary',
    noCrimeText: 'N/A',
    rows: {
      batchId: 'Crime mapping Batch ID:',
      crimeReference: 'Crime Reference number:',
      crimeType: 'Crime Type:',
      fromDateTime: 'Crime Date/Time from:',
      toDateTime: 'Crime Date/Time to:',
      latitude: 'Latitude:',
      longitude: 'Longitude:',
      crimeText: 'Crime Text:',
    },
  },

  personSummary: {
    titlePrefix: 'Person',
    rows: {
      fullName: 'Full name',
      dateOfBirth: 'DOB:',
      pncNumber: 'PNC number:',
      address: 'Specified Address:',
      emsId: 'EMS ID:',
    },
  },

  detailsOfAllegation: {
    heading: 'Details of Allegation',
    additionalInformation: 'Additional Information',
    noAdditionalInformation: 'N/A',
    rows: {
      crimeType: 'Crime Type',
      crimeReference: 'Crime Reference',
      batchId: 'Crime Batch',
      fromDateTime: 'From Date/Time',
      toDateTime: 'To Date/Time',
      crimeLocation: 'Crime Location\n(Lat/Long)',
    },
  },

  witnessStatement: {
    heading: 'WITNESS STATEMENT',
    legislation: '(CJ Act 1967, s.9; MC Act 1980, ss.5A(3) (a) and 5B; Criminal Procedure Rules 2005, Rule 27.1)',
    age: 'Age: Over 18',
    statementOfLabel: 'Statement of',
    declaration: {
      prefix: 'This statement consisting of',
      suffix:
        'pages, signed by me, is true to the best of my knowledge and belief. I make it known that, if it is given in evidence, I shall be liable to prosecution if I have wilfully stated in it, anything that I know to be false or do not believe to be true.',
      pageCountPlaceholder: 'XX',
    },
    occupationLabel: 'Occupation',
    signatureLabel: 'Signature',
    dateLabel: 'Date',
    emailLabel: 'Email',
    addressLabel: 'Address',
    preferredCommunicationMethod: 'preferred communication method',
    narrative: {
      employedByPrefix: 'I am currently employed by the Ministry of Justice (MoJ) as ',
      employedBySuffix: 'within the Electronic Monitoring Acquisitive Crime Hub (EMAC Hub).',
      hubFunction:
        'The main function of the EMAC Hub is to utilise the MoJ crime mapping tool to cross check acquisitive crime data supplied by participating Police Forces with the movement data of persons who are subject to acquisitive crime licence conditions. An EMAC Hub Caseworker manually reviews matches and based on accuracy of the data will qualify matches based on their own professional judgement.',
      reviewDatePrefix: 'On',
      reviewedMatchPrefix: 'I reviewed a qualified match in relation to crime data supplied by',
      reviewedMatchSuffix:
        'As a result of this process, I can confirm the attached match in relation to an allegation of',
      crimeReferencePrefix: 'Crime Reference No.',
    },
    exhibits: {
      emac01: {
        prefix: 'Exhibit EMAC/01 - Image of the tracks for',
        suffix: 'on the data.',
      },
      emac02: {
        prefix: 'Exhibit EMAC/02 - Detailed image of map and locations for',
      },
      emac03: 'Exhibit EMAC/03 - Key for interpreting symbols on crime map',
      emac04: {
        prefix: 'Exhibit EMAC/04 - Table of',
        suffix: 'locations within the vicinity.',
      },
    },
    preferredEmail: 'mojacquisitivecrimehub@justice.gov.uk',
    address: '102 Petty France, Westminster, London, SW1H 9AJ',
    miniTableHeaders: {
      personName: 'Person name',
      firstLocationDateTime: 'First location point in vicinity\ndate/time',
      lastLocationDateTime: 'Last location point in vicinity\ndate/time',
    },
    exhibitsIntro:
      "I further produce the attached screen shot which documents the subject's movements within proximity of this allegation of crime:",
    exhibitMapKey: 'Exhibit EMAC/03 - Key for interpreting symbols on crime map',
  },
} as const

export default PROXIMITY_ALERT_REPORT_CONTENT
