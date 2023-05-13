import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { createCookieHeader } from '../utilities/create-cookie-header.utility.js';

// this is a testing function so I can log in as a mock user.
// should be deleted later, and is just a temporary APIGatewayProxyEvent

// export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
//     const id = 'merchantid';

//     // const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
//     //     expiresIn: '1d',
//     // });

//     const cookieHeader = createCookieHeader('authToken', token);

//     return {
//         statusCode: 200,
//         headers: {
//             'Content-Type': 'text/plain',
//             // Location: redirectUrl,
//             // 'Content-Type': 'text/html',
//             'Set-Cookie': cookieHeader,
//         },
//         // cookies: [cookieHeader],
//         body: 'JWT token 1 set as a cookie',
//     };
// };
