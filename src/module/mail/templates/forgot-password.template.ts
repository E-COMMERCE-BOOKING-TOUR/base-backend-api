export const forgotPasswordTemplate = (fullName: string, resetLink: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hi ${fullName},</p>
        <p>You received this email because we received a request to reset the password for your account.</p>
        <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">RESET PASSWORD</a>
        </div>
        <p>If you did not request this change, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #666;">Best regards,<br>TripConnect Team</p>
    </div>
`;
