import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../wayfinder';
import changePasswordC4aa2c from './change-password';
import security176da1 from './security';

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
export const changePassword = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: changePassword.url(options),
    method: 'get',
});

changePassword.definition = {
    methods: ['get', 'head'],
    url: '/settings/change-password',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
changePassword.url = (options?: RouteQueryOptions) => {
    return changePassword.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
changePassword.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: changePassword.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
changePassword.head = (
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: changePassword.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
const changePasswordForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: changePassword.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
changePasswordForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: changePassword.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::changePassword
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
changePasswordForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: changePassword.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

changePassword.form = changePasswordForm;
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
const settings = {
    changePassword: Object.assign(changePassword, changePasswordC4aa2c),
    security: Object.assign(security, security176da1),
};

export default settings;
