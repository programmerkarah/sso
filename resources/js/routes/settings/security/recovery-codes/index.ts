import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/settings/security/recovery-codes',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\SettingsController::show
 * @see app/Http/Controllers/SettingsController.php:38
 * @route '/settings/security/recovery-codes'
 */
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

show.form = showForm;
/**
 * @see \App\Http\Controllers\SettingsController::regenerate
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
export const regenerate = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: regenerate.url(options),
    method: 'post',
});

regenerate.definition = {
    methods: ['post'],
    url: '/settings/security/recovery-codes/regenerate',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::regenerate
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerate.url = (options?: RouteQueryOptions) => {
    return regenerate.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::regenerate
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::regenerate
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
const regenerateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: regenerate.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::regenerate
 * @see app/Http/Controllers/SettingsController.php:68
 * @route '/settings/security/recovery-codes/regenerate'
 */
regenerateForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: regenerate.url(options),
    method: 'post',
});

regenerate.form = regenerateForm;
const recoveryCodes = {
    show: Object.assign(show, show),
    regenerate: Object.assign(regenerate, regenerate),
};

export default recoveryCodes;
