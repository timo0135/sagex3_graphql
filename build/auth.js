import { log } from 'console';
import jsonwebtoken from 'jsonwebtoken';
;
export function getAuthToken(options, audience) {
    const { clientId, secret, user, lifetime } = options;
    console.log('Generating token with options:', { clientId, secret, user, lifetime, audience });
    // If the token is issued in the future, the server will return an error 21
    // In some cases, the time difference between computer might cause this issue,
    // so it may require to adjust the issued at (iat) value.
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expInSeconds = nowInSeconds + 300;
    const token = {
        iss: clientId,
        aud: audience || '',
        // aud: '',
        iat: nowInSeconds,
        exp: expInSeconds,
    };
    if (user)
        token.sub = user;
    console.log('JWT Payload:', token);
    return jsonwebtoken.sign(token, secret, { algorithm: 'HS256' });
}
//# sourceMappingURL=auth.js.map