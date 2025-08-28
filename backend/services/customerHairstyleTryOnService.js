const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { configDotenv } = require('dotenv');
configDotenv();

// YouCam Online Editor API Configuration
const YOUCAM_CONFIG = {
  BASE_URL: process.env.YOUCAM_API_URL || 'https://yce-api-01.perfectcorp.com',
  API_KEY: process.env.YOUCAM_API_KEY,
  CLIENT_SECRET: process.env.YOUCAM_SECRET_KEY, // RSA public key for encryption
  UPLOAD_DIR: path.join(__dirname, '../public/uploads/customer-tryon'),
  PROCESSED_DIR: path.join(__dirname, '../public/uploads/customer-tryon/processed'),
  MAX_RETRIES: 3,
  TIMEOUT: 60000
};

// Cache for access token
let accessTokenCache = {
  token: null,
  expiresAt: null
};

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(YOUCAM_CONFIG.UPLOAD_DIR)) {
    fs.mkdirSync(YOUCAM_CONFIG.UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(YOUCAM_CONFIG.PROCESSED_DIR)) {
    fs.mkdirSync(YOUCAM_CONFIG.PROCESSED_DIR, { recursive: true });
  }
}

// Generate encrypted id_token for authentication
function generateIdToken() {
  try {
    if (!YOUCAM_CONFIG.API_KEY || !YOUCAM_CONFIG.CLIENT_SECRET) {
      throw new Error('API Key and Client Secret are required for authentication');
    }

    const timestamp = Date.now();
    const dataToEncrypt = `client_id=${YOUCAM_CONFIG.API_KEY}&timestamp=${timestamp}`;

    console.log('🔐 Generating id_token...');
    console.log(`   Data to encrypt: ${dataToEncrypt}`);
    console.log(`   Timestamp: ${timestamp}`);

    // Format the client_secret as a proper RSA public key
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${YOUCAM_CONFIG.CLIENT_SECRET}\n-----END PUBLIC KEY-----`;

    console.log(`   Using RSA public key for encryption`);

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

    console.log(`✅ id_token generated successfully`);
    return idToken;

  } catch (error) {
    console.error('Failed to generate id_token:', error.message);
    throw new Error(`Failed to generate id_token: ${error.message}`);
  }
}

// Authenticate with YouCam API and get access token
async function authenticateWithYouCam() {
  try {
    // Check if we have a valid cached token
    if (accessTokenCache.token && accessTokenCache.expiresAt && Date.now() < accessTokenCache.expiresAt) {
      console.log('✅ Using cached access token');
      return accessTokenCache.token;
    }

    console.log('🔐 Authenticating with YouCam API...');

    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    if (!YOUCAM_CONFIG.CLIENT_SECRET) {
      throw new Error('YouCam Client Secret not configured');
    }

    const idToken = generateIdToken();

    const authUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/client/auth`;
    const authPayload = {
      client_id: YOUCAM_CONFIG.API_KEY,
      id_token: idToken
    };

    console.log(`🌐 Authenticating: ${authUrl}`);

    const response = await axios.post(authUrl, authPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    if (response.data.status !== 200) {
      throw new Error(`Authentication failed: ${response.data.error_code || 'Unknown error'}`);
    }

    const accessToken = response.data.result.access_token;
    const expiresIn = response.data.result.expires_in || 3600; // Default to 1 hour

    // Cache the token
    accessTokenCache = {
      token: accessToken,
      expiresAt: Date.now() + (expiresIn * 1000) - 60000 // Expire 1 minute early
    };

    console.log(`✅ Authentication successful. Token expires in ${expiresIn} seconds`);
    return accessToken;

  } catch (error) {
    console.error('Authentication failed:', error.message);
    if (error.response?.data) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
}

// Get authenticated headers for API calls
async function getAuthenticatedHeaders() {
  const accessToken = await authenticateWithYouCam();
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// Get available hairstyles from YouCam (style groups)
async function getAvailableHairstyles(filters = {}) {
  try {
    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    console.log('🔍 cYouCam Config:', {
      BASE_URL: YOUCAM_CONFIG.BASE_URL,
      API_KEY: YOUCAM_CONFIG.API_KEY ? '***configured***' : 'NOT CONFIGURED'
    });

    const queryParams = new URLSearchParams();
    if (filters.page_size) queryParams.append('page_size', filters.page_size);
    if (filters.starting_token) queryParams.append('starting_token', filters.starting_token);

    // Get style groups first
    const styleGroupsUrl = `https://yce-api-01.perfectcorp.com/s2s/v1.0/task/style-group/hair-style`;
    console.log(`🌐 Getting style groups: ${styleGroupsUrl}`);

    const groupsResponse = await axios.get(styleGroupsUrl, {
      headers: await getAuthenticatedHeaders(),
      timeout: 30000
    });

    console.log(`✅ Style groups response:`, groupsResponse.data);

    if (groupsResponse.data.status !== 200) {
      throw new Error(`YouCam API error: ${groupsResponse.data.message || 'Unknown error'}`);
    }

    const groups = groupsResponse.data.result.groups || [];
    const allStyles = [];

    // Get styles for each group
    for (const group of groups) {
      const groupId = group.id;
      const groupTitle = group.info.title;

      console.log(`🎨 Getting styles for group: ${groupTitle} (ID: ${groupId})`);

      const stylesUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/style/hair-style?page_size=20&style_group_id=${groupId}`;

      try {
        const stylesResponse = await axios.get(stylesUrl, {
          headers: await getAuthenticatedHeaders(),
          timeout: 30000
        });


        if (stylesResponse.data.status === 200) {
          const styles = stylesResponse.data.result.styles || [];
          console.log(`✅ Found ${styles.length} styles in group ${groupTitle}`);

          // Map styles to our format
          const mappedStyles = styles.map(style => ({
            id: style.id,
            name: style.info?.title || `Style ${style.id}`,
            category: groupTitle.toLowerCase(),
            gender: groupTitle.toLowerCase(),
            length: style.info?.length || 'medium',
            style: style.info?.style || 'classic',
            image_url: style.info?.preview_url || null,
            description: style.info?.description || `${groupTitle} hairstyle`,
            group_id: groupId,
            group_title: groupTitle
          }));

          allStyles.push(...mappedStyles);
        } else {
          console.log(`❌ Failed to get styles for group ${groupTitle}: ${stylesResponse.data.error}`);
        }
      } catch (error) {
        console.log(`❌ Failed to get styles for group ${groupTitle}: ${error.message}`);
      }
    }

    return {
      success: true,
      data: allStyles,
      total: allStyles.length,
      page: 1,
      limit: allStyles.length,
      message: 'Hairstyles retrieved successfully from YouCam API',
      groups: groups
    };

  } catch (error) {
    console.error('Failed to get YouCam hairstyles:', error.message);
    throw error;
  }
}

// Get hairstyle categories (style groups)
async function getHairstyleCategories() {
  try {
    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    const url = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/style-group/hair-style?page_size=20`;
    console.log(`🌐 Getting style groups: ${url}`);

    const response = await axios.get(url, {
      headers: await getAuthenticatedHeaders(),
      timeout: 30000
    });

    if (response.data.status !== 200) {
      throw new Error(`YouCam API error: ${response.data.message || 'Unknown error'}`);
    }

    const groups = response.data.result.groups || [];

    // Map groups to categories
    const categories = groups.map(group => ({
      id: group.id,
      name: group.info.title,
      count: 0, // We'll need to count styles for each group
      description: `${group.info.title} hairstyles`
    }));

    return {
      success: true,
      data: categories,
      message: 'Hairstyle categories retrieved successfully from YouCam API'
    };

  } catch (error) {
    console.error('Failed to get hairstyle categories:', error.message);
    throw error;
  }
}



// Apply hairstyle to customer photo
async function tryOnHairstyle(customerImagePath, hairstyleId, groupId, options = {}) {
  try {
    ensureDirectories();

    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    console.log('🎨 Starting hairstyle try-on process...');
    console.log(`   Customer image: ${customerImagePath}`);
    console.log(`   Hairstyle ID: ${hairstyleId}`);
    console.log(`   Group ID: ${groupId}`);

    // Step 1: Upload the customer image
    console.log('📤 Step 1: Uploading customer image...');
    const uploadResponse = await uploadImageToYouCam(customerImagePath);

    if (!uploadResponse.file_id) {
      throw new Error('Failed to upload image to YouCam');
    }

    console.log(`✅ Image uploaded successfully. File ID: ${uploadResponse.file_id}`);

    // Step 2: Validate group and style IDs
    console.log('🔍 Step 2: Validating group and style IDs...');

    // Step 3: Start the hairstyle task
    console.log('🎨 Step 3: Starting hairstyle task...');

    const taskPayload = {
      request_id: 5055, // Use timestamp as request_id
      payload: {
        file_sets: {
          src_ids: [uploadResponse.file_id]
        },
        actions: [
          {
            id: 0,
            params: {
              style_group_id: parseInt(groupId),
              style_ids: [parseInt(hairstyleId)]
            }
          }
        ]
      }
    };

    console.log(`📋 Task payload:`, JSON.stringify(taskPayload, null, 2));

    const taskUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/hair-style`;
    console.log(`🌐 Starting task: ${taskUrl}`);

    const taskResponse = await axios.post(taskUrl, taskPayload, {
      headers: await getAuthenticatedHeaders(),
      timeout: 60000
    });

    if (taskResponse.data.status !== 200) {
      throw new Error(`Task creation failed: ${taskResponse.data.message || 'Unknown error'}`);
    }

    const taskId = taskResponse.data.result.task_id;
    console.log(`✅ Task started successfully. Task ID: ${taskId}`);

    // Step 3: Poll for task completion
    console.log('⏳ Step 3: Polling for task completion...');
    const result = await pollTaskStatus(taskId);

    return {
      success: true,
      task_id: taskId,
      file_id: uploadResponse.file_id,
      result: result,
      message: 'Hairstyle try-on completed successfully'
    };

  } catch (error) {
    console.error('Failed to try on hairstyle:', error.message);
    throw error;
  }
}

// Generate multiple hairstyle variations
async function generateHairstyleVariations(customerImagePath, options = {}) {
  try {
    ensureDirectories();

    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    console.log('🎨 Starting hairstyle variation generation...');
    console.log(`   Customer image: ${customerImagePath}`);

    // Step 1: Upload the customer image
    console.log('📤 Step 1: Uploading customer image...');
    const uploadResponse = await uploadImageToYouCam(customerImagePath);

    if (!uploadResponse.file_id) {
      throw new Error('Failed to upload image to YouCam');
    }

    console.log(`✅ Image uploaded successfully. File ID: ${uploadResponse.file_id}`);

    // Step 2: Get available styles for variations
    const numVariations = options.num_variations || 5;
    const groupId = options.group_id || 18213963761051864; // Default to Female group

    console.log(`🎨 Step 2: Getting ${numVariations} style variations...`);

    const stylesUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/style/hair-style?page_size=${numVariations}&style_group_id=${groupId}`;
    const stylesResponse = await axios.get(stylesUrl, {
      headers: await getAuthenticatedHeaders(),
      timeout: 30000
    });

    if (stylesResponse.data.status !== 200) {
      throw new Error('Failed to get style variations');
    }

    const styles = stylesResponse.data.result.styles || [];
    const selectedStyles = styles.slice(0, numVariations);

    console.log(`✅ Found ${selectedStyles.length} styles for variations`);

    // Step 3: Create tasks for each variation
    const tasks = [];
    for (let i = 0; i < selectedStyles.length; i++) {
      const style = selectedStyles[i];
      const taskPayload = {
        request_id: Date.now() + i, // Unique request_id for each variation
        payload: {
          file_sets: {
            src_ids: [uploadResponse.file_id]
          },
          actions: [
            {
              id: 0,
              params: {
                style_group_id: groupId,
                style_ids: [style.id]
              }
            }
          ]
        }
      };

      const taskUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/hair-style`;
      const taskResponse = await axios.post(taskUrl, taskPayload, {
        headers: await getAuthenticatedHeaders(),
        timeout: 60000
      });

      if (taskResponse.data.status === 200) {
        tasks.push({
          task_id: taskResponse.data.result.task_id,
          style: style
        });
      }
    }

    console.log(`✅ Created ${tasks.length} variation tasks`);

    // Step 4: Poll for all task completions
    console.log('⏳ Step 4: Polling for all task completions...');
    const results = [];

    for (const task of tasks) {
      try {
        const result = await pollTaskStatus(task.task_id);
        results.push({
          style: task.style,
          result: result
        });
      } catch (error) {
        console.log(`❌ Task ${task.task_id} failed: ${error.message}`);
      }
    }

    return {
      success: true,
      file_id: uploadResponse.file_id,
      variations: results,
      message: `Generated ${results.length} hairstyle variations successfully`
    };

  } catch (error) {
    console.error('Failed to generate hairstyle variations:', error.message);
    throw error;
  }
}

// Upload image to YouCam
async function uploadImageToYouCam(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log(`📤 Uploading image: ${imagePath}`);

    const fileName = path.basename(imagePath);
    const fileExtension = path.extname(fileName).toLowerCase();

    // Determine content type
    let contentType = 'image/jpeg';
    if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    }

    // Step 1: Get upload URL
    const uploadUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/file/hair-style`;
    const uploadPayload = {
      files: [{
        content_type: contentType,
        file_name: fileName
      }]
    };

    console.log(`🌐 Getting upload URL: ${uploadUrl}`);

    const uploadResponse = await axios.post(uploadUrl, uploadPayload, {
      headers: await getAuthenticatedHeaders(),
      timeout: 30000
    });

    if (uploadResponse.data.status !== 200) {
      throw new Error(`Upload URL request failed: ${uploadResponse.data.message || 'Unknown error'}`);
    }

    const fileInfo = uploadResponse.data.result.files[0];
    const fileId = fileInfo.file_id;
    const uploadUrl2 = fileInfo.requests[0].url;

    console.log(`✅ Got upload URL. File ID: ${fileId}`);
    console.log(`📄 File info:`, JSON.stringify(fileInfo, null, 2));

    if (!uploadUrl2) {
      console.log('⚠️ Upload URL is null, trying alternative upload method...');

      // Alternative: Try uploading directly to the file endpoint
      const directUploadUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/file/hair-style`;
      const imageBuffer = fs.readFileSync(imagePath);

      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: fileName,
        contentType: contentType
      });

      const directUploadResponse = await axios.post(directUploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          ...await getAuthenticatedHeaders()
        },
        timeout: 60000
      });

      if (directUploadResponse.data.status !== 200) {
        throw new Error(`Direct upload failed: ${directUploadResponse.data.message || 'Unknown error'}`);
      }

      console.log(`✅ Direct upload successful`);
      return {
        file_id: directUploadResponse.data.result.files[0].file_id,
        file_name: fileName,
        content_type: contentType
      };
    }

    // Step 2: Upload the actual file using the provided upload URL
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadFileResponse = await axios.put(uploadUrl2, imageBuffer, {
      headers: {
        'Content-Type': contentType
      },
      timeout: 60000
    });

    if (uploadFileResponse.status !== 200) {
      throw new Error('File upload failed');
    }

    console.log(`✅ File uploaded successfully`);

    return {
      file_id: fileId,
      file_name: fileName,
      content_type: contentType
    };

  } catch (error) {
    console.error('Failed to upload image to YouCam:', error.message);
    throw error;
  }
}

// Poll task status
async function pollTaskStatus(taskId) {
  const maxAttempts = 30; // 5 minutes with 10-second intervals
  const pollInterval = 10000; // 10 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusUrl = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/hair-style?task_id=${taskId}`;

      const statusResponse = await axios.get(statusUrl, {
        headers: await getAuthenticatedHeaders(),
        timeout: 30000
      });

      if (statusResponse.data.status !== 200) {
        throw new Error(`Status check failed: ${statusResponse.data.message || 'Unknown error'}`);
      }

      const taskStatus = statusResponse.data.result;
      console.log(`📊 Task status (attempt ${attempt}): ${taskStatus.status}`);

      if (taskStatus.status === 'success') {
        console.log(`✅ Task completed successfully`);
        return taskStatus;
      } else if (taskStatus.status === 'error') {
        throw new Error(`Task failed: ${taskStatus.error_message || 'Unknown error'}`);
      } else if (taskStatus.status === 'processing') {
        console.log(`⏳ Task still processing... waiting ${pollInterval / 1000} seconds`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } else {
        console.log(`⚠️ Unknown task status: ${taskStatus.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

    } catch (error) {
      console.log(`❌ Status check attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxAttempts) {
        throw new Error(`Task polling timeout after ${maxAttempts} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Task polling timeout');
}

// Save try-on session (local JSON file for demo)
async function saveTryOnSession(customerId, sessionData) {
  try {
    ensureDirectories();

    const sessionFile = path.join(YOUCAM_CONFIG.UPLOAD_DIR, `session_${customerId}.json`);
    const sessions = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile, 'utf8')) : [];

    const session = {
      id: `session_${Date.now()}`,
      customer_id: customerId,
      created_at: new Date().toISOString(),
      ...sessionData
    };

    sessions.push(session);
    fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));

    return session;
  } catch (error) {
    console.error('Failed to save try-on session:', error.message);
    throw error;
  }
}

// Get try-on history for customer
async function getTryOnHistory(customerId) {
  try {
    ensureDirectories();

    const sessionFile = path.join(YOUCAM_CONFIG.UPLOAD_DIR, `session_${customerId}.json`);

    if (!fs.existsSync(sessionFile)) {
      return [];
    }

    const sessions = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    return sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Failed to get try-on history:', error.message);
    throw error;
  }
}

// Download processed image from YouCam
async function downloadTryOnImage(imageUrl, outputPath) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 30000
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to download try-on image:', error.message);
    throw error;
  }
}

// Poll for processing status
async function pollTryOnStatus(processingId) {
  try {
    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    // Try different status endpoints
    const statusEndpoints = [
      `/status/${processingId}`,
      `/ai/status/${processingId}`,
      `/v1/status/${processingId}`,
      `/job/status/${processingId}`,
      `/processing/status/${processingId}`
    ];

    for (const endpoint of statusEndpoints) {
      try {
        const url = `${YOUCAM_CONFIG.BASE_URL}${endpoint}`;
        console.log(`Trying status endpoint: ${url}`);

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${YOUCAM_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        console.log(`Success with status endpoint: ${endpoint}`);
        return response.data;

      } catch (error) {
        console.log(`Failed with status endpoint ${endpoint}: ${error.response?.status} - ${error.message}`);

        if (error.response?.status === 401 || error.response?.status === 403) {
          break;
        }
      }
    }

    throw new Error('All YouCam status endpoints failed');

  } catch (error) {
    console.error('Failed to poll try-on status:', error.message);
    throw error;
  }
}

// Get hairstyle groups from YouCam (mimics the provided functionality)
async function getHairstyleGroups(pageSize = 20, startingToken = null) {
  try {
    if (!YOUCAM_CONFIG.API_KEY) {
      throw new Error('YouCam API key not configured');
    }

    console.log('🔍 Getting hairstyle groups from YouCam...');
    console.log(`   Page size: ${pageSize}`);
    console.log(`   Starting token: ${startingToken || 'null'}`);

    const queryParams = new URLSearchParams();
    if (pageSize) queryParams.append('page_size', pageSize);
    if (startingToken) queryParams.append('starting_token', startingToken);

    const url = `${YOUCAM_CONFIG.BASE_URL}/s2s/v1.0/task/style-group/hair-style?${queryParams}`;
    console.log(`🌐 Requesting: ${url}`);

    const response = await axios.get(url, {
      headers: await getAuthenticatedHeaders(),
      timeout: 30000
    });

    console.log(`✅ Response status: ${response.status}`);
    console.log(`📄 Response data:`, response.data);

    if (response.data.status !== 200) {
      throw new Error(`YouCam API error: ${response.data.message || 'Unknown error'}`);
    }

    return {
      success: true,
      data: response.data.result,
      message: 'Hairstyle groups retrieved successfully from YouCam API'
    };

  } catch (error) {
    console.error('Failed to get hairstyle groups:', error.message);
    throw error;
  }
}

module.exports = {
  getAvailableHairstyles,
  getHairstyleCategories,
  getHairstyleGroups,
  tryOnHairstyle,
  generateHairstyleVariations,
  uploadImageToYouCam,
  pollTaskStatus,
  authenticateWithYouCam,
  generateIdToken,
  getAuthenticatedHeaders,
  saveTryOnSession,
  getTryOnHistory,
  downloadTryOnImage,
};