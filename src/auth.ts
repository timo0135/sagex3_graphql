import jsonwebtoken from 'jsonwebtoken';
interface JwtTokenInfo {
    iss: string;
    sub?: string;
    aud?: string;
    iat: number;
    exp: number;
};
 
export interface ConnectedAppOptions{
    clientId: string;
    secret: string;
    url: string;
    user:string;
    lifetime: number;
}


export function getAuthToken(options:ConnectedAppOptions, audience?:string): string {
	const {clientId,secret,user,lifetime} = options;
    console.log('Generating token with options:', {clientId, secret, user, lifetime, audience});
	// If the token is issued in the future, the server will return an error 21
	// In some cases, the time difference between computer might cause this issue,
	// so it may require to adjust the issued at (iat) value.
	const nowInSeconds = Math.floor(Date.now() / 1000);
	const expInSeconds = nowInSeconds + 300;
	const token:JwtTokenInfo = {
		iss: clientId,
		aud: audience || '',
        // aud: '',
		iat: nowInSeconds,
		exp: expInSeconds,
	};
	if (user) token.sub = user;
    console.log('JWT Payload:', token);

	return jsonwebtoken.sign(token, secret,  { algorithm: 'HS256' });
}



