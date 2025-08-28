const axios = require('axios');
const crypto = require('crypto');

// YouCam API Configuration
const YOUCAM_CONFIG = {
    BASE_URL: 'https://yce-api-01.perfectcorp.com',
    API_KEY: 'kZKrIk3A9ic52cBAoC5oDPUMihDqqoQ9',
    CLIENT_SECRET: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCh0nK2eCmYwrTHs9kofUnbg/y0eNlKvDKgi0LV9WL3xwZNazh4+uf2itatBH9fGYCQfXqrbZ3KGcDloQLoTTKvkfmXMfH0498dCB8LLsUJAk/1JbD9LF7mJWeDjTkztY29R7yiSBFmrGgJhp6wU3AI3sTquatkrBB4iJvPzRnK8wIDAQAB'
};

async function debugYouCamAuth() {
    console.log('🔍 Debugging YouCam API Authentication...\n');

    console.log('📋 Configuration:');
    console.log(`   Base URL: ${YOUCAM_CONFIG.BASE_URL}`);
    console.log(`   API Key: ${YOUCAM_CONFIG.API_KEY}`);
    console.log(`   Client Secret: ${YOUCAM_CONFIG.CLIENT_SECRET.substring(0, 50)}...\n`);

    // Step 1: Test basic connectivity
    console.log('🌐 Step 1: Testing basic connectivity...');
    try {
        const response = await axios.get(YOUCAM_CONFIG.BASE_URL, {
            timeout: 10000
        });
        console.log(`   ✅ Base URL accessible (Status: ${response.status})`);
    } catch (error) {
        console.log(`   ❌ Base URL not accessible: ${error.message}`);
        return;
    }

    // Step 2: Test different auth endpoints
    console.log('\n🔐 Step 2: Testing authentication endpoints...');
    const authEndpoints = [
        '/s2s/v1.0/auth',
        '/s2s/v1.1/auth',
        '/auth',
        '/api/auth',
        '/v1/auth',
        '/v2/auth',
        '/s2s/auth'
    ];

    for (const endpoint of authEndpoints) {
        try {
            const authUrl = `${YOUCAM_CONFIG.BASE_URL}${endpoint}`;
            console.log(`   Testing: ${authUrl}`);

            const response = await axios.get(authUrl, {
                timeout: 10000
            });
            console.log(`   ✅ Endpoint exists (Status: ${response.status})`);

        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`   ❌ Endpoint not found (404)`);
            } else if (error.response?.status === 405) {
                console.log(`   ✅ Endpoint exists but wrong method (405)`);
            } else {
                console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
            }
        }
    }

    // Step 3: Test RSA encryption
    console.log('\n🔐 Step 3: Testing RSA encryption...');
    try {
        const timestamp = Date.now();
        const dataToEncrypt = `client_id=${YOUCAM_CONFIG.API_KEY}&timestamp=${timestamp}`;

        console.log(`   Data to encrypt: ${dataToEncrypt}`);
        console.log(`   Timestamp: ${timestamp}`);

        // Format the client_secret as a proper RSA public key
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${YOUCAM_CONFIG.CLIENT_SECRET}\n-----END PUBLIC KEY-----`;

        // Encrypt the data using RSA with public key
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(dataToEncrypt, 'utf8')
        );

        // Convert to Base64
        const idToken = encrypted.toString('base64');

        console.log(`   ✅ RSA encryption successful`);
        console.log(`   id_token length: ${idToken.length} characters`);
        console.log(`   id_token preview: ${idToken.substring(0, 50)}...`);

    } catch (error) {
        console.log(`   ❌ RSA encryption failed: ${error.message}`);
        return;
    }

    // Step 4: Test authentication with different endpoints
    console.log('\n🔐 Step 4: Testing authentication requests...');

    const timestamp = Date.now();
    const dataToEncrypt = `client_id=${YOUCAM_CONFIG.API_KEY}&timestamp=${timestamp}`;
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${YOUCAM_CONFIG.CLIENT_SECRET}\n-----END PUBLIC KEY-----`;
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(dataToEncrypt, 'utf8')
    );
    const idToken = encrypted.toString('base64');

    const authPayload = {
        client_id: YOUCAM_CONFIG.API_KEY,
        id_token: idToken
    };

    for (const endpoint of ['/s2s/v1.0/auth', '/s2s/v1.1/auth', '/auth']) {
        try {
            const authUrl = `${YOUCAM_CONFIG.BASE_URL}${endpoint}`;
            console.log(`   Testing auth: ${authUrl}`);

            const response = await axios.post(authUrl, authPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            });

            console.log(`   ✅ Auth successful (Status: ${response.status})`);
            console.log(`   📄 Response:`, JSON.stringify(response.data, null, 2));

        } catch (error) {
            console.log(`   ❌ Auth failed: ${error.response?.status || error.code} - ${error.message}`);
            if (error.response?.data) {
                console.log(`   📄 Error response:`, JSON.stringify(error.response.data, null, 2));
            }
        }
    }

    // Step 5: Test direct API key usage
    console.log('\n🔑 Step 5: Testing direct API key usage...');
    try {
        const testUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/style-group/hair-style?page_size=1`;
        console.log(`   Testing: ${testUrl}`);

        const response = await axios.get(testUrl, {
            headers: {
                'Authorization': `Bearer ${YOUCAM_CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        console.log(`   ✅ Direct API key works (Status: ${response.status})`);
        console.log(`   📄 Response:`, JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log(`   ❌ Direct API key failed: ${error.response?.status || error.code} - ${error.message}`);
        if (error.response?.data) {
            console.log(`   📄 Error response:`, JSON.stringify(error.response.data, null, 2));
        }
    }

    console.log('\n📝 Debug Summary:');
    console.log('🔍 Check the above results to identify the authentication issue');
}

// Run the debug
debugYouCamAuth().catch(console.error);
