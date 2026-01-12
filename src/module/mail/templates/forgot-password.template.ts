export const forgotPasswordTemplate = (fullName: string, resetLink: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Chào ${fullName},</p>
        <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu. Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
        </div>
        <p>Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #666;">Trân trọng,<br>Đội ngũ TripConnect</p>
    </div>
`;
