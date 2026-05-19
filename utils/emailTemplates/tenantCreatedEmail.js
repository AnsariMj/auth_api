const tenantCreatedEmail = (tenantName) => {
  return `
Hello,

Your tenant "${tenantName}" has been created successfully.

You can now:
- Add users
- Manage roles
- Configure settings

Welcome to your workspace!

Regards,
Ansari Tech Team
`;
};

module.exports = tenantCreatedEmail;
