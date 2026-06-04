import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/admin/organizations',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::index
 * @see app/Http/Controllers/Admin/OrganizationController.php:16
 * @route '/admin/organizations'
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
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
export const create = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});

create.definition = {
    methods: ['get', 'head'],
    url: '/admin/organizations/create',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
const createForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
 */
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::create
 * @see app/Http/Controllers/Admin/OrganizationController.php:36
 * @route '/admin/organizations/create'
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
 * @see \App\Http\Controllers\Admin\OrganizationController::store
 * @see app/Http/Controllers/Admin/OrganizationController.php:41
 * @route '/admin/organizations'
 */
export const store = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/admin/organizations',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::store
 * @see app/Http/Controllers/Admin/OrganizationController.php:41
 * @route '/admin/organizations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::store
 * @see app/Http/Controllers/Admin/OrganizationController.php:41
 * @route '/admin/organizations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::store
 * @see app/Http/Controllers/Admin/OrganizationController.php:41
 * @route '/admin/organizations'
 */
const storeForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::store
 * @see app/Http/Controllers/Admin/OrganizationController.php:41
 * @route '/admin/organizations'
 */
storeForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
export const edit = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
});

edit.definition = {
    methods: ['get', 'head'],
    url: '/admin/organizations/{organization}/edit',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
edit.url = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { organization: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { organization: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            organization: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        organization:
            typeof args.organization === 'object'
                ? args.organization.id
                : args.organization,
    };

    return (
        edit.definition.url
            .replace('{organization}', parsedArgs.organization.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
edit.get = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
edit.head = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
const editForm = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
editForm.get = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\OrganizationController::edit
 * @see app/Http/Controllers/Admin/OrganizationController.php:66
 * @route '/admin/organizations/{organization}/edit'
 */
editForm.head = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
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
 * @see \App\Http\Controllers\Admin\OrganizationController::update
 * @see app/Http/Controllers/Admin/OrganizationController.php:73
 * @route '/admin/organizations/{organization}'
 */
export const update = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

update.definition = {
    methods: ['put'],
    url: '/admin/organizations/{organization}',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::update
 * @see app/Http/Controllers/Admin/OrganizationController.php:73
 * @route '/admin/organizations/{organization}'
 */
update.url = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { organization: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { organization: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            organization: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        organization:
            typeof args.organization === 'object'
                ? args.organization.id
                : args.organization,
    };

    return (
        update.definition.url
            .replace('{organization}', parsedArgs.organization.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::update
 * @see app/Http/Controllers/Admin/OrganizationController.php:73
 * @route '/admin/organizations/{organization}'
 */
update.put = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::update
 * @see app/Http/Controllers/Admin/OrganizationController.php:73
 * @route '/admin/organizations/{organization}'
 */
const updateForm = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
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
 * @see \App\Http\Controllers\Admin\OrganizationController::update
 * @see app/Http/Controllers/Admin/OrganizationController.php:73
 * @route '/admin/organizations/{organization}'
 */
updateForm.put = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
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
 * @see \App\Http\Controllers\Admin\OrganizationController::toggleActive
 * @see app/Http/Controllers/Admin/OrganizationController.php:98
 * @route '/admin/organizations/{organization}/toggle-active'
 */
export const toggleActive = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
});

toggleActive.definition = {
    methods: ['post'],
    url: '/admin/organizations/{organization}/toggle-active',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::toggleActive
 * @see app/Http/Controllers/Admin/OrganizationController.php:98
 * @route '/admin/organizations/{organization}/toggle-active'
 */
toggleActive.url = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { organization: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { organization: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            organization: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        organization:
            typeof args.organization === 'object'
                ? args.organization.id
                : args.organization,
    };

    return (
        toggleActive.definition.url
            .replace('{organization}', parsedArgs.organization.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::toggleActive
 * @see app/Http/Controllers/Admin/OrganizationController.php:98
 * @route '/admin/organizations/{organization}/toggle-active'
 */
toggleActive.post = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::toggleActive
 * @see app/Http/Controllers/Admin/OrganizationController.php:98
 * @route '/admin/organizations/{organization}/toggle-active'
 */
const toggleActiveForm = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleActive.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\OrganizationController::toggleActive
 * @see app/Http/Controllers/Admin/OrganizationController.php:98
 * @route '/admin/organizations/{organization}/toggle-active'
 */
toggleActiveForm.post = (
    args:
        | { organization: number | { id: number } }
        | [organization: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleActive.url(args, options),
    method: 'post',
});

toggleActive.form = toggleActiveForm;
const OrganizationController = {
    index,
    create,
    store,
    edit,
    update,
    toggleActive,
};

export default OrganizationController;
