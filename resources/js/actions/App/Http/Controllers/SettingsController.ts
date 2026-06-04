import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
export const security = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: security.url(options),
    method: 'get',
});

security.definition = {
    methods: ['get', 'head'],
    url: '/settings/security',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
security.url = (options?: RouteQueryOptions) => {
    return security.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
security.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: security.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
security.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: security.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
const securityForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: security.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
securityForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: security.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::security
 * @see app/Http/Controllers/SettingsController.php:19
 * @route '/settings/security'
 */
securityForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: security.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

security.form = securityForm;
/**
 * @see \App\Http\Controllers\SettingsController::updatePassword
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
export const updatePassword = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updatePassword.url(options),
    method: 'post',
});

updatePassword.definition = {
    methods: ['post'],
    url: '/settings/security/password',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::updatePassword
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
updatePassword.url = (options?: RouteQueryOptions) => {
    return updatePassword.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::updatePassword
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
updatePassword.post = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updatePassword.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::updatePassword
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
const updatePasswordForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updatePassword.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::updatePassword
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
updatePasswordForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updatePassword.url(options),
    method: 'post',
});

updatePassword.form = updatePasswordForm;
/**
 * @see \App\Http\Controllers\SettingsController::updateEmail
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
export const updateEmail = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updateEmail.url(options),
    method: 'post',
});

updateEmail.definition = {
    methods: ['post'],
    url: '/settings/security/email',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::updateEmail
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
updateEmail.url = (options?: RouteQueryOptions) => {
    return updateEmail.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::updateEmail
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
updateEmail.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateEmail.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::updateEmail
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
const updateEmailForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateEmail.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::updateEmail
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
updateEmailForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateEmail.url(options),
    method: 'post',
});

updateEmail.form = updateEmailForm;
/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
export const showRecoveryCodes = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: showRecoveryCodes.url(options),
    method: 'get',
});

showRecoveryCodes.definition = {
    methods: ['get', 'head'],
    url: '/settings/security/recovery-codes',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showRecoveryCodes.url = (options?: RouteQueryOptions) => {
    return showRecoveryCodes.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showRecoveryCodes.get = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: showRecoveryCodes.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showRecoveryCodes.head = (
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: showRecoveryCodes.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
const showRecoveryCodesForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: showRecoveryCodes.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showRecoveryCodesForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: showRecoveryCodes.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::showRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showRecoveryCodesForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: showRecoveryCodes.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

showRecoveryCodes.form = showRecoveryCodesForm;
/**
 * @see \App\Http\Controllers\SettingsController::regenerateRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
export const regenerateRecoveryCodes = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: regenerateRecoveryCodes.url(options),
    method: 'post',
});

regenerateRecoveryCodes.definition = {
    methods: ['post'],
    url: '/settings/security/recovery-codes/regenerate',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::regenerateRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerateRecoveryCodes.url = (options?: RouteQueryOptions) => {
    return regenerateRecoveryCodes.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::regenerateRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerateRecoveryCodes.post = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: regenerateRecoveryCodes.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::regenerateRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
const regenerateRecoveryCodesForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: regenerateRecoveryCodes.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::regenerateRecoveryCodes
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerateRecoveryCodesForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: regenerateRecoveryCodes.url(options),
    method: 'post',
});

regenerateRecoveryCodes.form = regenerateRecoveryCodesForm;
const SettingsController = {
    security,
    updatePassword,
    updateEmail,
    showRecoveryCodes,
    regenerateRecoveryCodes,
};

export default SettingsController;
