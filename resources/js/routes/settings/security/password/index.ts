import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
export const update = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

update.definition = {
    methods: ['post'],
    url: '/settings/security/password',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
const updateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:99
 * @route '/settings/security/password'
 */
updateForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

update.form = updateForm;
const password = {
    update: Object.assign(update, update),
};

export default password;
