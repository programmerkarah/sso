import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../wayfinder';
import authorize from './authorize';

/**
 * @see \Laravel\Passport\Http\Controllers\ApproveAuthorizationController::approve
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
export const approve = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: approve.url(options),
    method: 'post',
});

approve.definition = {
    methods: ['post'],
    url: '/oauth/authorize',
} satisfies RouteDefinition<['post']>;

/**
 * @see \Laravel\Passport\Http\Controllers\ApproveAuthorizationController::approve
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
approve.url = (options?: RouteQueryOptions) => {
    return approve.definition.url + queryParams(options);
};

/**
 * @see \Laravel\Passport\Http\Controllers\ApproveAuthorizationController::approve
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
approve.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(options),
    method: 'post',
});

/**
 * @see \Laravel\Passport\Http\Controllers\ApproveAuthorizationController::approve
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
const approveForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: approve.url(options),
    method: 'post',
});

/**
 * @see \Laravel\Passport\Http\Controllers\ApproveAuthorizationController::approve
 * @see vendor/laravel/passport/src/Http/Controllers/ApproveAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
approveForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: approve.url(options),
    method: 'post',
});

approve.form = approveForm;
/**
 * @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
export const deny = (
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: deny.url(options),
    method: 'delete',
});

deny.definition = {
    methods: ['delete'],
    url: '/oauth/authorize',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
deny.url = (options?: RouteQueryOptions) => {
    return deny.definition.url + queryParams(options);
};

/**
 * @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
deny.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deny.url(options),
    method: 'delete',
});

/**
 * @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
const denyForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: deny.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \Laravel\Passport\Http\Controllers\DenyAuthorizationController::deny
 * @see vendor/laravel/passport/src/Http/Controllers/DenyAuthorizationController.php:25
 * @route '/oauth/authorize'
 */
denyForm.delete = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: deny.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

deny.form = denyForm;
const authorizations = {
    authorize: Object.assign(authorize, authorize),
    approve: Object.assign(approve, approve),
    deny: Object.assign(deny, deny),
};

export default authorizations;
