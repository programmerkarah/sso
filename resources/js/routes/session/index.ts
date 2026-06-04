import {
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
    queryParams,
} from './../../wayfinder';

/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
export const ping = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ping.url(options),
    method: 'get',
});

ping.definition = {
    methods: ['get', 'head'],
    url: '/session/ping',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
ping.url = (options?: RouteQueryOptions) => {
    return ping.definition.url + queryParams(options);
};

/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
ping.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ping.url(options),
    method: 'get',
});
/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
ping.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ping.url(options),
    method: 'head',
});

/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
const pingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ping.url(options),
    method: 'get',
});

/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
pingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ping.url(options),
    method: 'get',
});
/**
 * @see routes/web.php:27
 * @route '/session/ping'
 */
pingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ping.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

ping.form = pingForm;
const session = {
    ping: Object.assign(ping, ping),
};

export default session;
