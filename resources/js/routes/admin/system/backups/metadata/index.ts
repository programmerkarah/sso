import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
export const update = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

update.definition = {
    methods: ['put'],
    url: '/admin/system/backups/{filename}/metadata',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
update.url = (
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
        update.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
update.put = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
const updateForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::update
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
updateForm.put = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

update.form = updateForm;
const metadata = {
    update: Object.assign(update, update),
};

export default metadata;
