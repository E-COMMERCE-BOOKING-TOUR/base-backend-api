export interface BookingStatusUpdateData {
    fullName: string;
    bookingId: number;
    tourName: string;
    oldStatus: string;
    newStatus: string;
    statusMessage: string;
    viewBookingLink: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#f59e0b' },
    pending_info: { label: 'Pending Info', color: '#f59e0b' },
    pending_payment: { label: 'Pending Payment', color: '#f59e0b' },
    pending_confirm: { label: 'Pending Confirmation', color: '#f59e0b' },
    waiting_supplier: { label: 'Waiting Supplier', color: '#3b82f6' },
    confirmed: { label: 'Confirmed', color: '#10b981' },
    paid: { label: 'Paid', color: '#10b981' },
    completed: { label: 'Completed', color: '#10b981' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
    refunded: { label: 'Refunded', color: '#8b5cf6' },
    expired: { label: 'Expired', color: '#6b7280' },
};

export const bookingStatusUpdateTemplate = (data: BookingStatusUpdateData) => {
    const statusInfo = statusLabels[data.newStatus] || { label: data.newStatus, color: '#6b7280' };

    return `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: ${statusInfo.color}; margin: 10px 0;">Booking Status Updated</h1>
        </div>
        
        <p>Dear <strong>${data.fullName}</strong>,</p>
        <p>Your booking status has been updated:</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.bookingId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Tour Name:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.tourName}</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                    <td style="padding: 12px 0; color: #333;">New Status:</td>
                    <td style="padding: 12px 0; font-weight: bold; text-align: right;">
                        <span style="background: ${statusInfo.color}; color: white; padding: 5px 12px; border-radius: 15px; font-size: 0.9em;">${statusInfo.label}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        ${data.statusMessage ? `
        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <p style="margin: 0; color: #0369a1;">${data.statusMessage}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewBookingLink}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">VIEW BOOKING DETAILS</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 0.9em; color: #666;">
            If you have any questions, please contact us via email or live chat on our website.
        </p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br>TripConnect Team</p>
    </div>
`;
};
