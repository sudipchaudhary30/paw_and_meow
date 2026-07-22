const crypto = require('crypto');

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBmStructureSecretKey';
const ESEWA_GATEWAY_URL = process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';

/**
 * Generates HMAC-SHA256 Base64 signature for eSewa v2 payment request.
 * Message format: total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}
 */
const generateEsewaSignature = (totalAmount, transactionUuid) => {
  const message = `total_amount=${String(totalAmount)},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
};

/**
 * Verifies HMAC-SHA256 Base64 signature from eSewa callback payload.
 */
const verifyEsewaCallbackSignature = (data) => {
  const { signature, signed_field_names } = data;
  if (!signature || !signed_field_names) {
    return false;
  }

  const fieldNames = signed_field_names.split(',');
  const messageParts = fieldNames.map(field => `${field}=${data[field]}`);
  const message = messageParts.join(',');

  const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
  hmac.update(message);
  const expectedSignature = hmac.digest('base64');

  return expectedSignature === signature;
};

/**
 * Verifies eSewa transaction directly with eSewa status verification API server-side.
 */
const verifyEsewaTransactionWithApi = async (totalAmount, transactionUuid) => {
  try {
    const url = `${ESEWA_VERIFY_URL}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`eSewa verification status HTTP error: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`eSewa status verification failed: ${error.message}`);
  }
};

module.exports = {
  generateEsewaSignature,
  verifyEsewaCallbackSignature,
  verifyEsewaTransactionWithApi,
  ESEWA_PRODUCT_CODE,
  ESEWA_GATEWAY_URL
};
