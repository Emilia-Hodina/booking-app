export const getResetPasswordEmail = (
  fullName: string,
  resetLink: string
): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center;">
      <img src="https://res.cloudinary.com/dxrqrpox4/image/upload/v1751223872/logo_xjrktj.png" alt="Wandr Logo" style="max-height: 100px;" />
    </div>

    <h2 style="text-align: center; color: #2f80ed;">Reset Password</h2>

    <p>Hi <strong>${fullName}</strong>,</p>
    <p>You requested to reset your password. Click the link below:</p>

    <p style="word-break: break-all;">
      <a href="${resetLink}" style="color: #2f80ed;">${resetLink}</a>
    </p>

    <p>If you didn’t request this, you can ignore this email.</p>
    <p style="margin-top: 40px;">— The Wandr Team</p>
  </div>
`;
