import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🌱 Verify Your Plant App Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d8a4e;">🌿 Welcome to Plant App!</h1>
        <p>Hi ${username},</p>
        <p>Thanks for signing up! Please verify your email address to start growing your digital plant.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2d8a4e; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Plant App. All rights reserved.</p>
      </div>
    `
  }

  return transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async (email, username, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔑 Reset Your Plant App Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d8a4e;">🌿 Password Reset</h1>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #e67e22; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Plant App. All rights reserved.</p>
      </div>
    `
  }

  return transporter.sendMail(mailOptions)
}

export const sendWiltingEmail = async (email, plantName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '⚠️ Your Plant Is Wilting!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">🌱 ${plantName} Needs Help!</h1>
        <p>Your digital plant <strong>${plantName}</strong> is wilting! Its health is below 30%.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #3498db; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Water Your Plant Now
          </a>
        </div>
        <p>Don't let ${plantName} die! Log in and give it some water.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Plant App. All rights reserved.</p>
      </div>
    `
  }

  return transporter.sendMail(mailOptions)
}