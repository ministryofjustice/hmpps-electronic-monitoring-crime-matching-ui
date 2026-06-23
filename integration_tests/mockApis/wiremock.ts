import superagent, { type SuperAgentRequest, type Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = body => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const parseAuditEventBody = (itm: { body?: string }) => {
  if (!itm.body || !itm.body.includes('MessageBody')) {
    return undefined
  }
  const eventJson = JSON.parse(JSON.parse(itm.body).MessageBody)
  delete eventJson.correlationId
  delete eventJson.when
  return eventJson
}

const getSentAuditEvents = async (): Promise<unknown> => {
  const wiremockApiResponse: Response = await superagent
    .post(`${url}/requests/find`)
    .send({ method: 'POST', urlPath: '/' })
  const responses = (wiremockApiResponse.body || '[]').requests
  return responses.map(parseAuditEventBody)
}

export { stubFor, getMatchingRequests, resetStubs, getSentAuditEvents }
