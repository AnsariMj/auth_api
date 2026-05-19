const forgotPasswordOtpEmail = (otp) => {
  return `
Your OTP is ${otp}

This OTP will expire in 10 minutes.

Do not share this OTP with anyone.
`;
};

module.exports = forgotPasswordOtpEmail;
