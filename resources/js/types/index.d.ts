export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    password_change_required?: boolean;
    last_login_at?: string;
    email_verified_at?: string;
    admin_verified_at?: string;
    two_factor_confirmed_at?: string;
    roles: string[];
    isAdmin: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Application {
    id: number;
    route_key: string;
    name: string;
    slug: string;
    description: string | null;
    domain: string;
    callback_url: string;
    logo_url: string | null;
    is_active: boolean;
    allowed_organization_types: string[];
    oauth_client_id: string | null;
    created_at: string;
    updated_at: string;
    oauth_client?: {
        id: string;
        secret: string | null;
        redirect: string;
    };
}

export interface Organization {
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    is_active: boolean;
    users_count: number;
    eligible_applications_count: number;
    eligible_applications: Array<{
        id: number;
        name: string;
    }>;
    created_at: string;
    updated_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    app: {
        name: string;
        product_name: string;
        product_short_name: string;
        description: string;
        locale: string;
    };
    navigation: {
        primary: Array<{ label: string; href: string; icon?: string }>;
        account: Array<{ label: string; href: string }>;
        admin: Array<{ label: string; href: string }>;
    };
    auth: {
        user: User | null;
        can: {
            manageApplications: boolean;
            manageUsers: boolean;
            manageSystem: boolean;
        };
    };
    flash: {
        success?: string;
        error?: string;
        info?: string;
        status?: string;
    };
};
