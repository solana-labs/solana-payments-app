import jwt from 'jsonwebtoken';
import { withAuth } from '../../../../../src/utilities/clients/merchant-ui/token-authenticate.utility.js';
describe('unit testing the token authenticate utility', () => {
    it('valid token authentication', () => {
        // Set my mock JWT_SECRET_KEY
        const mockJwtSecretKey = 'this-is-a-mock-jwt-secret-key';
        process.env.JWT_SECRET_KEY = mockJwtSecretKey;

        // Create my mock cookies
        const mockJwtPayload = {
            id: 'some-merchant-id',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        };
        const mockToken = jwt.sign(mockJwtPayload, mockJwtSecretKey, {});
        const mockCookies = [`Bearer=${mockToken}`];

        // Attempt to call the function and catch any thrown errors
        let result;
        try {
            result = withAuth(mockCookies);
        } catch (error) {
            // Fail the test if an error is thrown
            fail('withAuth threw an error: ' + error);
        }
        // Check the return value
        expect(result.id).toBe(mockJwtPayload.id);
    });
});
