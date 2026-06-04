import applications from './applications';
import organizations from './organizations';
import system from './system';
import users from './users';

const admin = {
    system: Object.assign(system, system),
    applications: Object.assign(applications, applications),
    users: Object.assign(users, users),
    organizations: Object.assign(organizations, organizations),
};

export default admin;
