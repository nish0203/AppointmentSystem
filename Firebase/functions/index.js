// index.js (Firebase Gen 2, Node 22+, Mailgun Numeric OTP)

import {onCall} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import formData from "form-data";
import Mailgun from "mailgun.js";

// Import fetch for Node.js compatibility
import fetch from "node-fetch";

admin.initializeApp();

// Mailgun setup
const DOMAIN = process.env.MAILGUN_DOMAIN || "ebbook.xyz";
const API_KEY = process.env.MAILGUN_API_KEY || "a1dad75f-5c87256f";

// Mailtrap setup
const MAILTRAP_TOKEN = process.env.MAILTRAP_API_TOKEN || "2f2a52f784196af93ff56b7bccd0cbaa";

// Helper to send via Mailgun API
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: "api", key: API_KEY});

// Numeric OTP generator
function randomCode(length = 6) {
  let code = "";
  while (code.length < length) code += Math.floor(Math.random() * 10);
  return code;
}

// Firestore collection for OTPs
const otpCol = admin.firestore().collection("emailOtps");

// --- SEND OTP ---
export const sendEmailOtp = onCall(
  {region: "us-central1", cpu: 1, memory: "256MiB"}, // Gen2 resources
  async (data, ctx) => {
    const {email} = data;
    if (!email) throw new Error("Missing email");

    // generate OTP
    const code = randomCode(6);
    await otpCol.doc(email).set({
      code,
      created: admin.firestore.FieldValue.serverTimestamp(),
    });

    // send email via Mailgun
    await mg.messages.create(DOMAIN, {
      from: `Uni Bookings <no-reply@${DOMAIN}>`,
      to: [email],
      subject: "Your Uni-Bookings Login Code",
      text: `Your login code is: ${code}\nIt will expire in 5 minutes.`,
    });

    return {success: true};
  }
);

// --- VERIFY OTP ---
export const verifyEmailOtp = onCall(
  {region: "us-central1", cpu: 1, memory: "256MiB"}, // Gen2 resources
  async (data, ctx) => {
    const {email, code} = data;
    if (!email || !code) throw new Error("Missing email or code");

    const snap = await otpCol.doc(email).get();
    if (!snap.exists) throw new Error("No code found");

    const {code: correct, created} = snap.data();
    const age = Date.now() - created.toDate().getTime();
    if (age > 5 * 60 * 1000) {
      await otpCol.doc(email).delete();
      throw new Error("Code expired");
    }
    if (code !== correct) throw new Error("Incorrect code");

    await otpCol.doc(email).delete();

    // Lookup role/profile
    const adminsSnap = await admin.firestore().collection("admins").doc(email).get();
    const lectSnap = await admin.firestore().collection("lecturers").doc(email).get();
    const studSnap = await admin.firestore().collection("students").doc(email).get();

    let role, profile;
    if (adminsSnap.exists) { role = "admin"; profile = adminsSnap.data(); }
    else if (lectSnap.exists) { role = "lecturer"; profile = lectSnap.data(); }
    else if (studSnap.exists) { role = "student"; profile = studSnap.data(); }
    else throw new Error("Email not registered");

    // Create a custom token for frontend login
    const uid = email;
    const claims = {role};
    await admin.auth().createUser({uid}).catch(() => {});
    const token = await admin.auth().createCustomToken(uid, claims);

    return {role, profile, token};
  }
);

// --- SEND MAILTRAP EMAIL ---
export const sendMailtrapEmail = onCall(
  {
    region: "us-central1", 
    cpu: 1, 
    memory: "256MiB",
    cors: true  // Enable CORS for web browsers
  },
  async (data, ctx) => {
    const {to_email, to_name, subject, html_content, text_content} = data;
    
    console.log('📧 Received Mailtrap email request:', { to_email, to_name, subject });
    
    if (!to_email || !subject || !html_content) {
      console.error('❌ Missing required fields:', { to_email: !!to_email, subject: !!subject, html_content: !!html_content });
      throw new Error("Missing required email fields");
    }

    try {
      const emailData = {
        from: {
          email: 'noreply@unibookings.com',
          name: 'Uni Bookings System'
        },
        to: [
          {
            email: to_email,
            name: to_name || 'User'
          }
        ],
        subject: subject,
        html: html_content,
        text: text_content || html_content.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      console.log('📤 Sending to Mailtrap API...');

      const response = await fetch('https://send.api.mailtrap.io/api/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILTRAP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent via Mailtrap:', result);
        return { success: true, result };
      } else {
        const errorText = await response.text();
        console.error('❌ Mailtrap API error:', response.status, errorText);
        throw new Error(`Mailtrap API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Failed to send email via Mailtrap:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
);
