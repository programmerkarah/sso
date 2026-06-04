import email from './email';
import password from './password';
import recoveryCodes from './recovery-codes';

const security = {
    password: Object.assign(password, password),
    email: Object.assign(email, email),
    recoveryCodes: Object.assign(recoveryCodes, recoveryCodes),
};

export default security;
