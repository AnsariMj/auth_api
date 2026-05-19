const tenantDeletedEmail = (tenantName) => {
  return `
Hello,

The tenant "${tenantName}" has been permanently deleted.

All access and data associated with this workspace is no longer available.

If you need clarification, please contact support.

Regards,
Ansari Tech Team
`;
};

module.exports = tenantDeletedEmail;
