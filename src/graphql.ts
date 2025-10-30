import * as https from 'https';
import axios from 'axios';

const client = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
});

export async function query(url: string, endpoint: string, token: string, request: string): Promise<any> {
    try {
        console.log('Sending request to:', { url, endpoint, request });
        console.log('Using token:', token);
        const response = await client.post(
            url,
            { query: request },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-xtrem-endpoint': endpoint,
                },
            }
        );
        return response.data;
    } catch (err: any) {
        // Provide richer error details for troubleshooting
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const body = err.response?.data;
            throw new Error(`Request failed with status code ${status}: ${JSON.stringify(body)}`);
        }
        throw err;
    }
}
