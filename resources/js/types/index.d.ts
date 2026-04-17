export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    last_login_at?: string;
    email_verified_at?: string;
    two_factor_confirmed_at?: string;
    roles: string[];
    isAdmin: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Application {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    domain: string;
    callback_url: string;
    logo_url: string | null;
    is_active: boolean;
    oauth_client_id: string | null;
    created_at: string;
    updated_at: string;
    oauth_client?: {
        id: string;
        secret: string;
        redirect: string;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
        can: {
            manageApplications: boolean;
            manageUsers: boolean;
        };
    };
    flash: {
        success?: string;
        error?: string;
        info?: string;
        status?: string;
        temporaryPassword?: string;
        temporaryPasswordFor?: string;
    };
};
