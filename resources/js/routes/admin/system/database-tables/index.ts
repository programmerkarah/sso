import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';
import rows from './rows';

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigate
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
export const navigate = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: navigate.url(options),
    method: 'post',
});

navigate.definition = {
    methods: ['post'],
    url: '/admin/system/database-tables/navigate',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigate
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigate.url = (options?: RouteQueryOptions) => {
    return navigate.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigate
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: navigate.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigate
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
const navigateForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: navigate.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigate
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigateForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: navigate.url(options),
    method: 'post',
});

navigate.form = navigateForm;
const databaseTables = {
    navigate: Object.assign(navigate, navigate),
    rows: Object.assign(rows, rows),
};

export default databaseTables;
