import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    applyUrlDefaults,
    queryParams,
} from './../../../../../wayfinder';

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
 * @see \App\Http\Controllers\Admin\SystemController::navigateDatabaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
export const navigateDatabaseTables = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: navigateDatabaseTables.url(options),
    method: 'post',
});

navigateDatabaseTables.definition = {
    methods: ['post'],
    url: '/admin/system/database-tables/navigate',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigateDatabaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigateDatabaseTables.url = (options?: RouteQueryOptions) => {
    return navigateDatabaseTables.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigateDatabaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigateDatabaseTables.post = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: navigateDatabaseTables.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigateDatabaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
const navigateDatabaseTablesForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: navigateDatabaseTables.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::navigateDatabaseTables
 * @see app/Http/Controllers/Admin/SystemController.php:251
 * @route '/admin/system/database-tables/navigate'
 */
navigateDatabaseTablesForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: navigateDatabaseTables.url(options),
    method: 'post',
});

navigateDatabaseTables.form = navigateDatabaseTablesForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::updateDatabaseTableRow
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
export const updateDatabaseTableRow = (
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: updateDatabaseTableRow.url(options),
    method: 'put',
});

updateDatabaseTableRow.definition = {
    methods: ['put'],
    url: '/admin/system/database-tables/rows',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateDatabaseTableRow
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
updateDatabaseTableRow.url = (options?: RouteQueryOptions) => {
    return updateDatabaseTableRow.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateDatabaseTableRow
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
updateDatabaseTableRow.put = (
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: updateDatabaseTableRow.url(options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateDatabaseTableRow
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
const updateDatabaseTableRowForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateDatabaseTableRow.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateDatabaseTableRow
 * @see app/Http/Controllers/Admin/SystemController.php:262
 * @route '/admin/system/database-tables/rows'
 */
updateDatabaseTableRowForm.put = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateDatabaseTableRow.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

updateDatabaseTableRow.form = updateDatabaseTableRowForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::backup
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
export const backup = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: backup.url(options),
    method: 'post',
});

backup.definition = {
    methods: ['post'],
    url: '/admin/system/backups',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::backup
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
backup.url = (options?: RouteQueryOptions) => {
    return backup.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::backup
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
backup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: backup.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::backup
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
const backupForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: backup.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::backup
 * @see app/Http/Controllers/Admin/SystemController.php:336
 * @route '/admin/system/backups'
 */
backupForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: backup.url(options),
    method: 'post',
});

backup.form = backupForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::destroyBackup
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
export const destroyBackup = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroyBackup.url(args, options),
    method: 'delete',
});

destroyBackup.definition = {
    methods: ['delete'],
    url: '/admin/system/backups/{filename}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroyBackup
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroyBackup.url = (
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
        destroyBackup.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroyBackup
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroyBackup.delete = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroyBackup.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroyBackup
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
const destroyBackupForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroyBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::destroyBackup
 * @see app/Http/Controllers/Admin/SystemController.php:440
 * @route '/admin/system/backups/{filename}'
 */
destroyBackupForm.delete = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroyBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

destroyBackup.form = destroyBackupForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::updateBackupMetadata
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
export const updateBackupMetadata = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: updateBackupMetadata.url(args, options),
    method: 'put',
});

updateBackupMetadata.definition = {
    methods: ['put'],
    url: '/admin/system/backups/{filename}/metadata',
} satisfies RouteDefinition<['put']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateBackupMetadata
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
updateBackupMetadata.url = (
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
        updateBackupMetadata.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateBackupMetadata
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
updateBackupMetadata.put = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: updateBackupMetadata.url(args, options),
    method: 'put',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateBackupMetadata
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
const updateBackupMetadataForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateBackupMetadata.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::updateBackupMetadata
 * @see app/Http/Controllers/Admin/SystemController.php:476
 * @route '/admin/system/backups/{filename}/metadata'
 */
updateBackupMetadataForm.put = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: updateBackupMetadata.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

updateBackupMetadata.form = updateBackupMetadataForm;
/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
export const downloadBackup = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: downloadBackup.url(args, options),
    method: 'get',
});

downloadBackup.definition = {
    methods: ['get', 'head'],
    url: '/admin/system/backups/{filename}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadBackup.url = (
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
        downloadBackup.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadBackup.get = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: downloadBackup.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadBackup.head = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: downloadBackup.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
const downloadBackupForm = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadBackupForm.get = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Admin\SystemController::downloadBackup
 * @see app/Http/Controllers/Admin/SystemController.php:430
 * @route '/admin/system/backups/{filename}'
 */
downloadBackupForm.head = (
    args:
        | { filename: string | number }
        | [filename: string | number]
        | string
        | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

downloadBackup.form = downloadBackupForm;
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
const SystemController = {
    index,
    databaseTables,
    navigateDatabaseTables,
    updateDatabaseTableRow,
    backup,
    destroyBackup,
    updateBackupMetadata,
    downloadBackup,
    restore,
};

export default SystemController;
