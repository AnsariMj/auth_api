const tenantInviteEmail = (tenantName, role) => {
  return `
You have been added to tenant "${tenantName}"

Assigned Role: ${role}

Please login to continue.
`;
};

module.exports = tenantInviteEmail;
