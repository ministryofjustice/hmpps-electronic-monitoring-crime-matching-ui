import superagent from 'superagent'

import qs from 'qs'
import { HttpError } from 'http-errors'
import config from '../config'

type OSMapsToken = {
  access_token: string
  expires_in: string
  issued_at: string
  token_type: string
}

export default class MapService {
  async getToken(): Promise<OSMapsToken> {
    try {
      const result = await superagent
        .post(config.maps.authUrl)
        .auth(config.maps.apiKey, config.maps.apiSecret)
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .send(qs.stringify({ grant_type: 'client_credentials' }))

      return result.body
    } catch (e) {
      if ((e as HttpError).status === 401) {
        throw new Error('Failed to authenticate to OS Maps API')
      }

      throw e
    }
  }
}
