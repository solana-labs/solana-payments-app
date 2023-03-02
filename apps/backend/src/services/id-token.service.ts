import axios from 'axios'
import {
    idTokenEndpoint,
    oAuthRedirectEndpoint,
} from '../configs/endpoints.config'

export const fetchIdToken = async (authCode: string) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': '',
    }
    const clientId = process.env.AUTH_0_CLIENT_ID
    const clientSecret = process.env.AUTH_0_CLIENT_SECRET
    const base = process.env.BASE_URL
    const domain = process.env.AUTH_0_DOMAIN
    const idTokenResponse = await axios.post(
        idTokenEndpoint(),
        {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: authCode,
            redirect_uri: base,
            scope: 'openid',
        },
        {
            headers,
        }
    )
    return idTokenResponse.data['id_token']
}
