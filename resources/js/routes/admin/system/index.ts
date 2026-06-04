import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../wayfinder';
import backups from './backups';
import databaseTablesE7ca8e from './database-tables';

/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/admin/system',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::index
 * @see app/Http/Controllers/Admin/SystemController.php:23
 * @route '/admin/system'
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
/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
export const databaseTables = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: databaseTables.url(options),
    method: 'get',
});

databaseTables.definition = {
    methods: ['get', 'head'],
    url: '/admin/system/database-tables',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
databaseTables.url = (options?: RouteQueryOptions) => {
    return databaseTables.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
databaseTables.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: databaseTables.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
databaseTables.head = (
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: databaseTables.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
const databaseTablesForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: databaseTables.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
databaseTablesForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: databaseTables.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::databaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:188
 * @route '/admin/system/database-tables'
 */
databaseTablesForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: databaseTables.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

databaseTables.form = databaseTablesForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::restore
 * @see app/Http/Controllers/Admin/SystemController.php:516
 * @route '/admin/system/restore'
 */
export const restore = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: restore.url(options),
    method: 'post',
});

restore.definition = {
    methods: ['post'],
    url: '/admin/system/restore',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::restore
 * @see app/Http/Controllers/Admin/SystemController.php:516
 * @route '/admin/system/restore'
 */
restore.url = (options?: RouteQueryOptions) => {
    return restore.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::restore
 * @see app/Http/Controllers/Admin/SystemController.php:516
 * @route '/admin/system/restore'
 */
restore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::restore
 * @see app/Http/Controllers/Admin/SystemController.php:516
 * @route '/admin/system/restore'
 */
const restoreForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: restore.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::restore
 * @see app/Http/Controllers/Admin/SystemController.php:516
 * @route '/admin/system/restore'
 */
restoreForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: restore.url(options),
    method: 'post',
});

restore.form = restoreForm;
const system = {
    index: Object.assign(index, index),
    databaseTables: Object.assign(databaseTables, databaseTablesE7ca8e),
    backups: Object.assign(backups, backups),
    restore: Object.assign(restore, restore),
};

export default system;
