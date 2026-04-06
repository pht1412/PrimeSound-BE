const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"PrimeSound" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        throw new Error('Failed to send email');
    }
};

const sendVerificationEmail = async (user) => {
    const token = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;

    await sendEmail({
        to: user.email,
        subject: 'Xác thực email - PrimeSound',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Xin chào ${user.name},</h2>
                <p>Cảm ơn bạn đã đăng ký PrimeSound. Vui lòng xác thực email bằng cách nhấp vào nút bên dưới:</p>
                <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Xác thực email</a>
                <p>Hoặc sao chép link: <a href="${verifyUrl}">${verifyUrl}</a></p>
                <p><small>Link có hiệu lực trong 24 giờ.</small></p>
            </div>
        `
    });

    return token;
};

const sendResetPasswordEmail = async (user) => {
    const token = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;

    await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu - PrimeSound',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Xin chào ${user.name},</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản PrimeSound của bạn.</p>
                <p>Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Đặt lại mật khẩu</a>
                <p>Hoặc sao chép link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p><small>Link có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</small></p>
            </div>
        `
    });

    return token;
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendResetPasswordEmail
};
