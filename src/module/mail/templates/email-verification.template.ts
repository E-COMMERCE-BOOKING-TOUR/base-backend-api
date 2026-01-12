export const emailVerificationTemplate = (fullName: string, verificationLink: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Xác nhận địa chỉ email</h2>
        <p>Chào ${fullName},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại TripConnect. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút bên dưới.</p>
        <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">XÁC NHẬN EMAIL</a>
        </div>
        <p>Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #666;">Trân trọng,<br>Đội ngũ TripConnect</p>
    </div>
`;
