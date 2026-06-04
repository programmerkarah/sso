import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
export const authorize = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: authorize.url(options),
    method: 'get',
});

authorize.definition = {
    methods: ['get', 'head'],
    url: '/oauth/authorize',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
authorize.url = (options?: RouteQueryOptions) => {
    return authorize.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
authorize.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: authorize.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
authorize.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: authorize.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
const authorizeForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: authorize.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
authorizeForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: authorize.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::authorize
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
authorizeForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: authorize.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

authorize.form = authorizeForm;
const CustomAuthorizationController = { authorize };

export default CustomAuthorizationController;
