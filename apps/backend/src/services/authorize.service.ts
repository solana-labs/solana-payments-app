import axios from "axios";

export const authorize = async () => {
  const clientId = process.env.AUTH_0_CLIENT_ID;
  const clientSecret = process.env.AUTH_0_CLIENT_SECRET;
  // const idTokenResponse = await axios.post(
  //     'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/oauth/token',
  //     {
  //         grant_type: 'client_credentials',
  //         client_id: clientId,
  //         client_secret: clientSecret,
  //         audience: 'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/api/v2/',
  //     },
  //     {
  //         headers: {},
  //     }
  // )

  // const response = await axios({
  //     url: 'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/oauth/token',
  //     method: 'post',
  //     data: JSON.stringify({
  //         grant_type: 'client_credentials',
  //         client_id: clientId,
  //         client_secret: clientSecret,
  //         audience: 'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/api/v2/',
  //     }),
  //     headers: {
  //         'Content-Type': 'application/json',
  //         'Accept-Encoding': '',
  //     },
  // })

  // console.log('hello')
  // console.log(response)

  // const response = await fetch(
  //     'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/oauth/token',
  //     {
  //         method: 'POST',
  //         headers: {
  //             'content-type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //             grant_type: 'client_credentials',
  //             client_id: clientId,
  //             client_secret: clientSecret,
  //             audience: 'https://dev-v6dn3jowxd8d3e1x.us.auth0.com/api/v2/',
  //         }),
  //     }
  // )

  // console.log(response)
};
