export interface BookingConfirmationData {
    fullName: string;
    bookingId: number;
    tourName: string;
    startDate: string;
    totalAmount: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    viewBookingLink: string;
}

export const bookingConfirmationTemplate = (data: BookingConfirmationData) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4DC9E6; margin: 0;">Booking Successful!</h1>
        </div>
        
        <p>Dear <strong>${data.fullName}</strong>,</p>
        <p>Thank you for booking with TripConnect. Your order has been successfully confirmed!</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.bookingId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Tour Name:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.tourName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Departure Date:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.startDate}</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                    <td style="padding: 12px 0; color: #333; font-weight: bold;">Total Amount:</td>
                    <td style="padding: 12px 0; font-weight: bold; text-align: right; color: #4DC9E6; font-size: 1.2em;">${data.totalAmount} ${data.currency}</td>
                </tr>
            </table>
        </div>
    
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewBookingLink}" style="background-color: #4DC9E6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">VIEW BOOKING DETAILS</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 0.9em; color: #666;">
            If you have any questions, please contact us via email or live chat on our website.
        </p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br>TripConnect Team</p>
    </div>
`;
