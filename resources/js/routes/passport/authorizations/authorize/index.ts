import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
export const debug = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: debug.url(options),
    method: 'get',
});

debug.definition = {
    methods: ['get', 'head'],
    url: '/oauth/authorize',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
debug.url = (options?: RouteQueryOptions) => {
    return debug.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
debug.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: debug.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
debug.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: debug.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
const debugForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: debug.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
debugForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: debug.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Auth\CustomAuthorizationController::debug
 * @see app/Http/Controllers/Auth/CustomAuthorizationController.php:20
 * @route '/oauth/authorize'
 */
debugForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: debug.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

debug.form = debugForm;
const authorize = {
    debug: Object.assign(debug, debug),
};

export default authorize;
