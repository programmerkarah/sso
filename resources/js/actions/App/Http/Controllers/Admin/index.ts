import ApplicationController from './ApplicationController';
import OrganizationController from './OrganizationController';
import SystemController from './SystemController';
import UserManagementController from './UserManagementController';

const Admin = {
    SystemController: Object.assign(SystemController, SystemController),
    ApplicationController: Object.assign(
        ApplicationController,
        ApplicationController,
    ),
    UserManagementController: Object.assign(
        UserManagementController,
        UserManagementController,
    ),
    OrganizationController: Object.assign(
        OrganizationController,
        OrganizationController,
    ),
};

export default Admin;
