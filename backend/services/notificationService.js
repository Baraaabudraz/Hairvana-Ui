const admin = require('../lib/firebase');
const { MobileDevice, Notification } = require('../models');

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

exports.sendToUsers = async (userIds, title, body, data) => {
  const devices = await MobileDevice.findAll({ where: { user_id: userIds } });
  if (!devices.length) return;

  const tokens = devices.map(d => d.device_token);
  const userIdsOrdered = devices.map(d => d.user_id);

  const tokenBatches = chunkArray(tokens, 500);
  const userIdBatches = chunkArray(userIdsOrdered, 500);

  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < tokenBatches.length; i++) {
    const batchTokens = tokenBatches[i];
    const batchUserIds = userIdBatches[i];
    console.log('Sending to tokens:', batchTokens);
    try {
      // --- TEST: Send minimal payload (only notification, no data) ---
      const response = await admin.messaging().sendEachForMulticast({
        notification: { title, body },
        data,
        tokens: batchTokens,
      });
      // --- To restore full payload, use this instead: ---
      // const response = await admin.messaging().sendEachForMulticast({
      //   notification: { title, body },
      //   data,
      //   tokens: batchTokens,
      // });
      console.log('FCM response:', JSON.stringify(response, null, 2));

      await Promise.all(response.responses.map((res, idx) =>
        Notification.create({
          user_id: batchUserIds[idx],
          title,
          body,
          data,
          status: res.success ? 'sent' : 'failed',
          sent_at: res.success ? new Date() : null,
        })
      ));

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    } catch (err) {
      console.error('Error sending push notification batch:', err);
    }
  }

  return {
    success: totalSuccess,
    failure: totalFailure,
    total: tokens.length,
  };
}; 