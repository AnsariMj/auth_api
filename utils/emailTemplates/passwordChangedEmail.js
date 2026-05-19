const passwordChangedEmail = (name) => {
  return `
Hello ${name},

Your password was changed successfully.

If this was not you, contact support immediately.
`;
};

module.exports = passwordChangedEmail;
