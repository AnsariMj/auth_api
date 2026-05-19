const tenantUpdatedEmail = (tenantName) => {
  return `
Hello,

The tenant "${tenantName}" has been updated.

Please log in to see the latest changes.

Regards,
Ansari Tech Team
`;
};

module.exports = tenantUpdatedEmail;
