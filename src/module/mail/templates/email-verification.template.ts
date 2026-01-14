export const emailVerificationTemplate = (fullName: string, verificationLink: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Hi ${fullName},</p>
        <p>Thank you for registering with TripConnect. Please verify your email address by clicking the button below.</p>
        <p>This link will expire in 24 hours.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">VERIFY EMAIL</a>
        </div>
        <p>If you did not create this account, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #666;">Best regards,<br>TripConnect Team</p>
    </div>
`;
