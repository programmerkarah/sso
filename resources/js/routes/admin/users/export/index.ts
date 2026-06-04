import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
export const excel = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: excel.url(options),
    method: 'get',
});

excel.definition = {
    methods: ['get', 'head'],
    url: '/admin/users/export/excel',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
excel.url = (options?: RouteQueryOptions) => {
    return excel.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
excel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: excel.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
excel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: excel.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
const excelForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: excel.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
excelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: excel.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::excel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
excelForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: excel.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

excel.form = excelForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
export const pdf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(options),
    method: 'get',
});

pdf.definition = {
    methods: ['get', 'head'],
    url: '/admin/users/export/pdf',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
pdf.url = (options?: RouteQueryOptions) => {
    return pdf.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
pdf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
pdf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
const pdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
pdfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::pdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
pdfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pdf.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

pdf.form = pdfForm;
const exportMethod = {
    excel: Object.assign(excel, excel),
    pdf: Object.assign(pdf, pdf),
};

export default exportMethod;
