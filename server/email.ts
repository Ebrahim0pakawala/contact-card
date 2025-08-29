import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}

export async function sendContactEmail(formData: ContactFormData): Promise<boolean> {
  try {
    const msg = {
      to: 'hussain@brightelectricals.co.in',
      from: 'noreply@brightelectricals.co.in', // Use a verified sender email
      subject: `New Contact Form Submission - ${formData.service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8ddf5a; border-bottom: 2px solid #8ddf5a; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #545454; margin-top: 0;">Customer Details</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
            <p><strong>Service Required:</strong> ${formData.service}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="color: #545454; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #8ddf5a; border-radius: 8px;">
            <p style="margin: 0; color: #545454; font-weight: bold;">
              Please respond to this inquiry as soon as possible.
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Customer Details:
Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
Service Required: ${formData.service}

Message:
${formData.message}

Please respond to this inquiry as soon as possible.
      `
    };

    await sgMail.send(msg);
    console.log('Contact form email sent successfully');
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}