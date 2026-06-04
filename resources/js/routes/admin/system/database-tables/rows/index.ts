import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
export const update = (
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
});

update.definition = {
    methods: ['put'],
    url: '/admin/system/database-tables/rows',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
const updateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
updateForm.put = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

update.form = updateForm;
const rows = {
    update: Object.assign(update, update),
};

export default rows;
