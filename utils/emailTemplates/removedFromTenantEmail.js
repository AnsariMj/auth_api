const removedFromTenantEmail = (tenantName) => {
  return `
Hello,

You have been removed from "${tenantName}".

You will no longer have access to this workspace.

If you believe this is a mistake, contact your admin.

Regards,
Ansari Tech Team
`;
};

module.exports = removedFromTenantEmail;
