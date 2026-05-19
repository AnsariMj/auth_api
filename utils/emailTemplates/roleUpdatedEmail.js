const roleUpdatedEmail = (userName, role) => {
  return `
Hello ${userName},

Your role has been updated.

New Role: ${role}

This change is effective immediately.

If you have questions, contact your tenant admin.

Regards,
Ansari Tech Team
`;
};

module.exports = roleUpdatedEmail;
