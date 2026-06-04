import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../../wayfinder';

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'post', 'head'],
    url: '/admin/users',
} satisfies RouteDefinition<['get', 'post', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
index.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: index.url(options),
    method: 'post',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
 */
indexForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: index.url(options),
    method: 'post',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::index
 * @see app/Http/Controllers/Admin/UserManagementController.php:31
 * @route '/admin/users'
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
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
export const exportExcel = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportExcel.url(options),
    method: 'get',
});

exportExcel.definition = {
    methods: ['get', 'head'],
    url: '/admin/users/export/excel',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
exportExcel.url = (options?: RouteQueryOptions) => {
    return exportExcel.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
exportExcel.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcel.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
exportExcel.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportExcel.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
const exportExcelForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportExcel.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
exportExcelForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportExcel.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportExcel
 * @see app/Http/Controllers/Admin/UserManagementController.php:166
 * @route '/admin/users/export/excel'
 */
exportExcelForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportExcel.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

exportExcel.form = exportExcelForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
export const exportPdf = (
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
});

exportPdf.definition = {
    methods: ['get', 'head'],
    url: '/admin/users/export/pdf',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
exportPdf.url = (options?: RouteQueryOptions) => {
    return exportPdf.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
exportPdf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
exportPdf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
const exportPdfForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
exportPdfForm.get = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::exportPdf
 * @see app/Http/Controllers/Admin/UserManagementController.php:224
 * @route '/admin/users/export/pdf'
 */
exportPdfForm.head = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: exportPdf.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

exportPdf.form = exportPdfForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetPassword
 * @see app/Http/Controllers/Admin/UserManagementController.php:258
 * @route '/admin/users/{user}/reset-password'
 */
export const resetPassword = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
});

resetPassword.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/reset-password',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetPassword
 * @see app/Http/Controllers/Admin/UserManagementController.php:258
 * @route '/admin/users/{user}/reset-password'
 */
resetPassword.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        resetPassword.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetPassword
 * @see app/Http/Controllers/Admin/UserManagementController.php:258
 * @route '/admin/users/{user}/reset-password'
 */
resetPassword.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetPassword
 * @see app/Http/Controllers/Admin/UserManagementController.php:258
 * @route '/admin/users/{user}/reset-password'
 */
const resetPasswordForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetPassword
 * @see app/Http/Controllers/Admin/UserManagementController.php:258
 * @route '/admin/users/{user}/reset-password'
 */
resetPasswordForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
});

resetPassword.form = resetPasswordForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetTwoFactor
 * @see app/Http/Controllers/Admin/UserManagementController.php:329
 * @route '/admin/users/{user}/reset-two-factor'
 */
export const resetTwoFactor = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: resetTwoFactor.url(args, options),
    method: 'post',
});

resetTwoFactor.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/reset-two-factor',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetTwoFactor
 * @see app/Http/Controllers/Admin/UserManagementController.php:329
 * @route '/admin/users/{user}/reset-two-factor'
 */
resetTwoFactor.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        resetTwoFactor.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetTwoFactor
 * @see app/Http/Controllers/Admin/UserManagementController.php:329
 * @route '/admin/users/{user}/reset-two-factor'
 */
resetTwoFactor.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: resetTwoFactor.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetTwoFactor
 * @see app/Http/Controllers/Admin/UserManagementController.php:329
 * @route '/admin/users/{user}/reset-two-factor'
 */
const resetTwoFactorForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: resetTwoFactor.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::resetTwoFactor
 * @see app/Http/Controllers/Admin/UserManagementController.php:329
 * @route '/admin/users/{user}/reset-two-factor'
 */
resetTwoFactorForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: resetTwoFactor.url(args, options),
    method: 'post',
});

resetTwoFactor.form = resetTwoFactorForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateIdentity
 * @see app/Http/Controllers/Admin/UserManagementController.php:416
 * @route '/admin/users/{user}/identity'
 */
export const updateIdentity = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updateIdentity.url(args, options),
    method: 'post',
});

updateIdentity.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/identity',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateIdentity
 * @see app/Http/Controllers/Admin/UserManagementController.php:416
 * @route '/admin/users/{user}/identity'
 */
updateIdentity.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        updateIdentity.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateIdentity
 * @see app/Http/Controllers/Admin/UserManagementController.php:416
 * @route '/admin/users/{user}/identity'
 */
updateIdentity.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updateIdentity.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateIdentity
 * @see app/Http/Controllers/Admin/UserManagementController.php:416
 * @route '/admin/users/{user}/identity'
 */
const updateIdentityForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateIdentity.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateIdentity
 * @see app/Http/Controllers/Admin/UserManagementController.php:416
 * @route '/admin/users/{user}/identity'
 */
updateIdentityForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateIdentity.url(args, options),
    method: 'post',
});

updateIdentity.form = updateIdentityForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:477
 * @route '/admin/users/{user}/access'
 */
export const updateAccess = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updateAccess.url(args, options),
    method: 'post',
});

updateAccess.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/access',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:477
 * @route '/admin/users/{user}/access'
 */
updateAccess.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        updateAccess.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:477
 * @route '/admin/users/{user}/access'
 */
updateAccess.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: updateAccess.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:477
 * @route '/admin/users/{user}/access'
 */
const updateAccessForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateAccess.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::updateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:477
 * @route '/admin/users/{user}/access'
 */
updateAccessForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateAccess.url(args, options),
    method: 'post',
});

updateAccess.form = updateAccessForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdminVerification
 * @see app/Http/Controllers/Admin/UserManagementController.php:530
 * @route '/admin/users/{user}/toggle-admin-verification'
 */
export const toggleAdminVerification = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleAdminVerification.url(args, options),
    method: 'post',
});

toggleAdminVerification.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/toggle-admin-verification',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdminVerification
 * @see app/Http/Controllers/Admin/UserManagementController.php:530
 * @route '/admin/users/{user}/toggle-admin-verification'
 */
toggleAdminVerification.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        toggleAdminVerification.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdminVerification
 * @see app/Http/Controllers/Admin/UserManagementController.php:530
 * @route '/admin/users/{user}/toggle-admin-verification'
 */
toggleAdminVerification.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleAdminVerification.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdminVerification
 * @see app/Http/Controllers/Admin/UserManagementController.php:530
 * @route '/admin/users/{user}/toggle-admin-verification'
 */
const toggleAdminVerificationForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleAdminVerification.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdminVerification
 * @see app/Http/Controllers/Admin/UserManagementController.php:530
 * @route '/admin/users/{user}/toggle-admin-verification'
 */
toggleAdminVerificationForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleAdminVerification.url(args, options),
    method: 'post',
});

toggleAdminVerification.form = toggleAdminVerificationForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchUpdateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:642
 * @route '/admin/users/access/batch'
 */
export const batchUpdateAccess = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: batchUpdateAccess.url(options),
    method: 'post',
});

batchUpdateAccess.definition = {
    methods: ['post'],
    url: '/admin/users/access/batch',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchUpdateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:642
 * @route '/admin/users/access/batch'
 */
batchUpdateAccess.url = (options?: RouteQueryOptions) => {
    return batchUpdateAccess.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchUpdateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:642
 * @route '/admin/users/access/batch'
 */
batchUpdateAccess.post = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: batchUpdateAccess.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchUpdateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:642
 * @route '/admin/users/access/batch'
 */
const batchUpdateAccessForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: batchUpdateAccess.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchUpdateAccess
 * @see app/Http/Controllers/Admin/UserManagementController.php:642
 * @route '/admin/users/access/batch'
 */
batchUpdateAccessForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: batchUpdateAccess.url(options),
    method: 'post',
});

batchUpdateAccess.form = batchUpdateAccessForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchVerify
 * @see app/Http/Controllers/Admin/UserManagementController.php:590
 * @route '/admin/users/verify/batch'
 */
export const batchVerify = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: batchVerify.url(options),
    method: 'post',
});

batchVerify.definition = {
    methods: ['post'],
    url: '/admin/users/verify/batch',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchVerify
 * @see app/Http/Controllers/Admin/UserManagementController.php:590
 * @route '/admin/users/verify/batch'
 */
batchVerify.url = (options?: RouteQueryOptions) => {
    return batchVerify.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchVerify
 * @see app/Http/Controllers/Admin/UserManagementController.php:590
 * @route '/admin/users/verify/batch'
 */
batchVerify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: batchVerify.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchVerify
 * @see app/Http/Controllers/Admin/UserManagementController.php:590
 * @route '/admin/users/verify/batch'
 */
const batchVerifyForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: batchVerify.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::batchVerify
 * @see app/Http/Controllers/Admin/UserManagementController.php:590
 * @route '/admin/users/verify/batch'
 */
batchVerifyForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: batchVerify.url(options),
    method: 'post',
});

batchVerify.form = batchVerifyForm;
/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdmin
 * @see app/Http/Controllers/Admin/UserManagementController.php:354
 * @route '/admin/users/{user}/toggle-admin'
 */
export const toggleAdmin = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleAdmin.url(args, options),
    method: 'post',
});

toggleAdmin.definition = {
    methods: ['post'],
    url: '/admin/users/{user}/toggle-admin',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdmin
 * @see app/Http/Controllers/Admin/UserManagementController.php:354
 * @route '/admin/users/{user}/toggle-admin'
 */
toggleAdmin.url = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        user: typeof args.user === 'object' ? args.user.id : args.user,
    };

    return (
        toggleAdmin.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdmin
 * @see app/Http/Controllers/Admin/UserManagementController.php:354
 * @route '/admin/users/{user}/toggle-admin'
 */
toggleAdmin.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: toggleAdmin.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdmin
 * @see app/Http/Controllers/Admin/UserManagementController.php:354
 * @route '/admin/users/{user}/toggle-admin'
 */
const toggleAdminForm = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleAdmin.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\UserManagementController::toggleAdmin
 * @see app/Http/Controllers/Admin/UserManagementController.php:354
 * @route '/admin/users/{user}/toggle-admin'
 */
toggleAdminForm.post = (
    args:
        | { user: number | { id: number } }
        | [user: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: toggleAdmin.url(args, options),
    method: 'post',
});

toggleAdmin.form = toggleAdminForm;
const UserManagementController = {
    index,
    exportExcel,
    exportPdf,
    resetPassword,
    resetTwoFactor,
    updateIdentity,
    updateAccess,
    toggleAdminVerification,
    batchUpdateAccess,
    batchVerify,
    toggleAdmin,
};

export default UserManagementController;
