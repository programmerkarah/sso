import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
export const update = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

update.definition = {
    methods: ['post'],
    url: '/settings/security/email',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
const updateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\SettingsController::update
 * @see app/Http/Controllers/SettingsController.php:138
 * @route '/settings/security/email'
 */
updateForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

update.form = updateForm;
const email = {
    update: Object.assign(update, update),
};

export default email;
