import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/settings/change-password',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
 */
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Settings\ChangePasswordController::show
 * @see app/Http/Controllers/Settings/ChangePasswordController.php:19
 * @route '/settings/change-password'
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
const ChangePasswordController = { show, update };

export default ChangePasswordController;
