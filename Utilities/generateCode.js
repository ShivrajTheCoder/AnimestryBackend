const crypto = require('crypto');
module.exports= generateVerificationCode = () => {
    const bytes = crypto.randomBytes(3); 
    const code = bytes.toString('hex').toUpperCase().slice(0, 6); 
    return code;
};