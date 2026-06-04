import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
export const exportPdf = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
});

exportPdf.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/{application}/guide/export-pdf',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportPdf.url = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { application: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { application: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            application: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        application:
            typeof args.application === 'object'
                ? args.application.id
                : args.application,
    };

    return (
        exportPdf.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportPdf.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportPdf.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: exportPdf.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
const exportPdfForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportPdfForm.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportPdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportPdfForm.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

exportPdf.form = exportPdfForm;
const guide = {
    exportPdf: Object.assign(exportPdf, exportPdf),
};

export default guide;
