import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
const index671f81e7531403dc53b140c56cc77a26 = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: index671f81e7531403dc53b140c56cc77a26.url(options),
    method: 'get',
});

index671f81e7531403dc53b140c56cc77a26.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
index671f81e7531403dc53b140c56cc77a26.url = (options?: RouteQueryOptions) => {
    return (
        index671f81e7531403dc53b140c56cc77a26.definition.url +
        queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
index671f81e7531403dc53b140c56cc77a26.get = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: index671f81e7531403dc53b140c56cc77a26.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
index671f81e7531403dc53b140c56cc77a26.head = (
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: index671f81e7531403dc53b140c56cc77a26.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
const index671f81e7531403dc53b140c56cc77a26Form = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index671f81e7531403dc53b140c56cc77a26.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
index671f81e7531403dc53b140c56cc77a26Form.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index671f81e7531403dc53b140c56cc77a26.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications'
 */
index671f81e7531403dc53b140c56cc77a26Form.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index671f81e7531403dc53b140c56cc77a26.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

index671f81e7531403dc53b140c56cc77a26.form =
    index671f81e7531403dc53b140c56cc77a26Form;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications/navigate'
 */
const index2f0dfda4e662850a014e17e56d2791cc = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: index2f0dfda4e662850a014e17e56d2791cc.url(options),
    method: 'post',
});

index2f0dfda4e662850a014e17e56d2791cc.definition = {
    methods: ['post'],
    url: '/admin/applications/navigate',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications/navigate'
 */
index2f0dfda4e662850a014e17e56d2791cc.url = (options?: RouteQueryOptions) => {
    return (
        index2f0dfda4e662850a014e17e56d2791cc.definition.url +
        queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications/navigate'
 */
index2f0dfda4e662850a014e17e56d2791cc.post = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: index2f0dfda4e662850a014e17e56d2791cc.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications/navigate'
 */
const index2f0dfda4e662850a014e17e56d2791ccForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: index2f0dfda4e662850a014e17e56d2791cc.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::index
 * @see app/Http/Controllers/Admin/ApplicationController.php:25
 * @route '/admin/applications/navigate'
 */
index2f0dfda4e662850a014e17e56d2791ccForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: index2f0dfda4e662850a014e17e56d2791cc.url(options),
    method: 'post',
});

index2f0dfda4e662850a014e17e56d2791cc.form =
    index2f0dfda4e662850a014e17e56d2791ccForm;

/**
 * Multiple routes resolve to \App\Http\Controllers\Admin\ApplicationController::index, so this export is a
 * dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
 * or import the route by name from your generated `routes/` directory.
 */
export const index = {
    '/admin/applications': index671f81e7531403dc53b140c56cc77a26,
    '/admin/applications/navigate': index2f0dfda4e662850a014e17e56d2791cc,
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
export const create = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});

create.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/create',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
const createForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::create
 * @see app/Http/Controllers/Admin/ApplicationController.php:69
 * @route '/admin/applications/create'
 */
createForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

create.form = createForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::store
 * @see app/Http/Controllers/Admin/ApplicationController.php:76
 * @route '/admin/applications'
 */
export const store = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/admin/applications',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::store
 * @see app/Http/Controllers/Admin/ApplicationController.php:76
 * @route '/admin/applications'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::store
 * @see app/Http/Controllers/Admin/ApplicationController.php:76
 * @route '/admin/applications'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::store
 * @see app/Http/Controllers/Admin/ApplicationController.php:76
 * @route '/admin/applications'
 */
const storeForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::store
 * @see app/Http/Controllers/Admin/ApplicationController.php:76
 * @route '/admin/applications'
 */
storeForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
export const show = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/{application}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
show.url = (
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
        show.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
show.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
show.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
const showForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
showForm.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::show
 * @see app/Http/Controllers/Admin/ApplicationController.php:147
 * @route '/admin/applications/{application}'
 */
showForm.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

show.form = showForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
export const guide = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: guide.url(args, options),
    method: 'get',
});

guide.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/{application}/guide',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
guide.url = (
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
        guide.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
guide.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: guide.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
guide.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: guide.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
const guideForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: guide.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
guideForm.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: guide.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::guide
 * @see app/Http/Controllers/Admin/ApplicationController.php:157
 * @route '/admin/applications/{application}/guide'
 */
guideForm.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: guide.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

guide.form = guideForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
export const exportGuidePdf = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportGuidePdf.url(args, options),
    method: 'get',
});

exportGuidePdf.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/{application}/guide/export-pdf',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportGuidePdf.url = (
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
        exportGuidePdf.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportGuidePdf.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportGuidePdf.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportGuidePdf.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: exportGuidePdf.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
const exportGuidePdfForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportGuidePdf.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportGuidePdfForm.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportGuidePdf.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::exportGuidePdf
 * @see app/Http/Controllers/Admin/ApplicationController.php:167
 * @route '/admin/applications/{application}/guide/export-pdf'
 */
exportGuidePdfForm.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportGuidePdf.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

exportGuidePdf.form = exportGuidePdfForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
export const edit = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
});

edit.definition = {
    methods: ['get', 'head'],
    url: '/admin/applications/{application}/edit',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
edit.url = (
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
        edit.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
edit.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
edit.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
const editForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
editForm.get = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::edit
 * @see app/Http/Controllers/Admin/ApplicationController.php:195
 * @route '/admin/applications/{application}/edit'
 */
editForm.head = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

edit.form = editForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::update
 * @see app/Http/Controllers/Admin/ApplicationController.php:203
 * @route '/admin/applications/{application}'
 */
export const update = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

update.definition = {
    methods: ['put'],
    url: '/admin/applications/{application}',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::update
 * @see app/Http/Controllers/Admin/ApplicationController.php:203
 * @route '/admin/applications/{application}'
 */
update.url = (
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
        update.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::update
 * @see app/Http/Controllers/Admin/ApplicationController.php:203
 * @route '/admin/applications/{application}'
 */
update.put = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::update
 * @see app/Http/Controllers/Admin/ApplicationController.php:203
 * @route '/admin/applications/{application}'
 */
const updateForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
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
 * @see \App\Http\Controllers\Admin\ApplicationController::update
 * @see app/Http/Controllers/Admin/ApplicationController.php:203
 * @route '/admin/applications/{application}'
 */
updateForm.put = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
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
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::destroy
 * @see app/Http/Controllers/Admin/ApplicationController.php:328
 * @route '/admin/applications/{application}'
 */
export const destroy = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

destroy.definition = {
    methods: ['delete'],
    url: '/admin/applications/{application}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::destroy
 * @see app/Http/Controllers/Admin/ApplicationController.php:328
 * @route '/admin/applications/{application}'
 */
destroy.url = (
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
        destroy.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::destroy
 * @see app/Http/Controllers/Admin/ApplicationController.php:328
 * @route '/admin/applications/{application}'
 */
destroy.delete = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::destroy
 * @see app/Http/Controllers/Admin/ApplicationController.php:328
 * @route '/admin/applications/{application}'
 */
const destroyForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
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
 * @see \App\Http\Controllers\Admin\ApplicationController::destroy
 * @see app/Http/Controllers/Admin/ApplicationController.php:328
 * @route '/admin/applications/{application}'
 */
destroyForm.delete = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
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
 * @see \App\Http\Controllers\Admin\ApplicationController::refreshSecret
 * @see app/Http/Controllers/Admin/ApplicationController.php:284
 * @route '/admin/applications/{application}/refresh-secret'
 */
export const refreshSecret = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: refreshSecret.url(args, options),
    method: 'post',
});

refreshSecret.definition = {
    methods: ['post'],
    url: '/admin/applications/{application}/refresh-secret',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::refreshSecret
 * @see app/Http/Controllers/Admin/ApplicationController.php:284
 * @route '/admin/applications/{application}/refresh-secret'
 */
refreshSecret.url = (
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
        refreshSecret.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::refreshSecret
 * @see app/Http/Controllers/Admin/ApplicationController.php:284
 * @route '/admin/applications/{application}/refresh-secret'
 */
refreshSecret.post = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: refreshSecret.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::refreshSecret
 * @see app/Http/Controllers/Admin/ApplicationController.php:284
 * @route '/admin/applications/{application}/refresh-secret'
 */
const refreshSecretForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: refreshSecret.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::refreshSecret
 * @see app/Http/Controllers/Admin/ApplicationController.php:284
 * @route '/admin/applications/{application}/refresh-secret'
 */
refreshSecretForm.post = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: refreshSecret.url(args, options),
    method: 'post',
});

refreshSecret.form = refreshSecretForm;
/**
 * @see \App\Http\Controllers\Admin\ApplicationController::toggleActive
 * @see app/Http/Controllers/Admin/ApplicationController.php:260
 * @route '/admin/applications/{application}/toggle-active'
 */
export const toggleActive = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
});

toggleActive.definition = {
    methods: ['post'],
    url: '/admin/applications/{application}/toggle-active',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::toggleActive
 * @see app/Http/Controllers/Admin/ApplicationController.php:260
 * @route '/admin/applications/{application}/toggle-active'
 */
toggleActive.url = (
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
        toggleActive.definition.url
            .replace('{application}', parsedArgs.application.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::toggleActive
 * @see app/Http/Controllers/Admin/ApplicationController.php:260
 * @route '/admin/applications/{application}/toggle-active'
 */
toggleActive.post = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::toggleActive
 * @see app/Http/Controllers/Admin/ApplicationController.php:260
 * @route '/admin/applications/{application}/toggle-active'
 */
const toggleActiveForm = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleActive.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\ApplicationController::toggleActive
 * @see app/Http/Controllers/Admin/ApplicationController.php:260
 * @route '/admin/applications/{application}/toggle-active'
 */
toggleActiveForm.post = (
    args:
        | { application: number | { id: number } }
        | [application: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleActive.url(args, options),
    method: 'post',
});

toggleActive.form = toggleActiveForm;
const ApplicationController = {
    index,
    create,
    store,
    show,
    guide,
    exportGuidePdf,
    edit,
    update,
    destroy,
    refreshSecret,
    toggleActive,
};

export default ApplicationController;
