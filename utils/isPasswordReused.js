const bcrypt = require("bcryptjs");

const isPasswordReused = async (newPassword, passwordHistory) => {
  for (let item of passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, item.password);
    if (isMatch) {
      return true;
    }
  }
  return false;
};

module.exports = isPasswordReused;
