import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../wayfinder';
import metadata from './metadata';

/**
 * @see \App\Http\Controllers\Admin\SystemController::create
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
export const create = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
});

create.definition = {
    methods: ['post'],
    url: '/admin/system/backups',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::create
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::create
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::create
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
const createForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::create
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
createForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
});

create.form = createForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::destroy
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
export const destroy = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

destroy.definition = {
    methods: ['delete'],
    url: '/admin/system/backups/{filename}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroy
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroy.url = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args };
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        filename: args.filename,
    };

    return (
        destroy.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroy
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroy.delete = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroy
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
const destroyForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroy
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroyForm.delete = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

destroy.form = destroyForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
export const download = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
});

download.definition = {
    methods: ['get', 'head'],
    url: '/admin/system/backups/{filename}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
download.url = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args };
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        filename: args.filename,
    };

    return (
        download.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
download.get = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
download.head = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
const downloadForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadForm.get = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::download
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadForm.head = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

download.form = downloadForm;
const backups = {
    create: Object.assign(create, create),
    destroy: Object.assign(destroy, destroy),
    metadata: Object.assign(metadata, metadata),
    download: Object.assign(download, download),
};

export default backups;
