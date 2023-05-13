import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

// this is a testing function so I can log in as a mock user.
// should be deleted later, and is just a temporary APIGatewayProxyEvent

export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const id = 'merchantid';

    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
    });

    const cookieOptions = {
        maxAge: 24 * 60 * 60, // 1 day in second
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    };

    const cookieHeader = `Bearer=${token}; Max-Age=${cookieOptions.maxAge}; HttpOnly;${
        cookieOptions.secure ? ' Secure' : ''
    }; SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            // Location: redirectUrl,
            // 'Content-Type': 'text/html',
            'Set-cookie': cookieHeader,
        },
        // cookies: [cookieHeader],
        body: 'JWT token 1 set as a cookie',
    };
};
