import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../wayfinder';

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::update
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:33
 * @route '/settings/change-password'
 */
export const update = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

update.definition = {
    methods: ['post'],
    url: '/settings/change-password',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::update
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:33
 * @route '/settings/change-password'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::update
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:33
 * @route '/settings/change-password'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::update
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:33
 * @route '/settings/change-password'
 */
const updateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::update
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:33
 * @route '/settings/change-password'
 */
updateForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
});

update.form = updateForm;
const changePassword = {
    update: Object.assign(update, update),
};

export default changePassword;
