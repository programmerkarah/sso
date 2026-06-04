import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/applications',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\ApplicationCatalogController::index
 * @see app/Http/Controllers/ApplicationCatalogController.php:14
 * @route '/applications'
 */
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

index.form = indexForm;
const ApplicationCatalogController = { index };

export default ApplicationCatalogController;
