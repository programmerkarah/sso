import Admin from './Admin';
import ApplicationCatalogController from './ApplicationCatalogController';
import Auth from './Auth';
import Settings from './Settings';
import SettingsController from './SettingsController';

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    Settings: Object.assign(Settings, Settings),
    SettingsController: Object.assign(SettingsController, SettingsController),
    ApplicationCatalogController: Object.assign(
        ApplicationCatalogController,
        ApplicationCatalogController,
    ),
    Admin: Object.assign(Admin, Admin),
};

export default Controllers;
