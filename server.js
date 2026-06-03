require('dotenv').config();
console.log("🔍 DIAGNOSTIC TEST - Email User is:", process.env.EMAIL_USER);
console.log("🔍 DIAGNOSTIC TEST - Email Pass is:", process.env.EMAIL_PASS ? "Loaded!" : "BLANK/UNDEFINED!");
console.log("🔍 DIAGNOSTIC TEST - Dispatch Email is:", process.env.DISPATCH_EMAIL);
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const {
  EMAIL_USER,
  EMAIL_PASS,
  DISPATCH_EMAIL,
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = '465',
  EMAIL_SECURE = 'true'
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS || !DISPATCH_EMAIL) {
  console.error('Missing required environment variables. Set EMAIL_USER, EMAIL_PASS, and DISPATCH_EMAIL.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: EMAIL_SECURE.toLowerCase() !== 'false',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

async function sendMail(mailOptions) {
  return transporter.sendMail(mailOptions);
}

function formatContactMail(payload) {
  const submittedAt = payload.submittedAt || new Date().toISOString();
  const service = payload.service || 'General Inquiry';
  const message = payload.message || 'No message provided.';

  return {
    from: EMAIL_USER,
    to: DISPATCH_EMAIL,
    subject: `New Contact Request — ${payload.name}`,
    text: `New contact form submission:\n\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email || 'N/A'}\nService: ${service}\n\nMessage:\n${message}\n\nSubmitted at: ${submittedAt}`,
    html: `
      <h2>New Contact Request</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Email:</strong> ${payload.email || 'N/A'}</p>
      <p><strong>Service:</strong> ${service}</p>
      <h3>Message</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p><strong>Submitted at:</strong> ${submittedAt}</p>
    `
  };
}

function formatAmbulanceRequestMail(payload) {
  const submittedAt = new Date().toISOString();
  const patient = payload.patient || {};
  const pickup = payload.pickup || {};
  const destination = payload.destination || {};
  const medical = payload.medical || {};
  const additional = payload.additional || {};
  const emergencyContact = payload.emergencyContact || {};

  const requirements = [
    medical.oxygen && 'Oxygen Required',
    medical.wheelchair && 'Wheelchair Required',
    medical.stretcher && 'Stretcher Required',
    medical.cardiac && 'Cardiac Monitoring',
    medical.ventilator && 'Ventilator Support',
    medical.nurse && 'Nurse Required',
    medical.doctor && 'Doctor Required'
  ].filter(Boolean);

  return {
    from: EMAIL_USER,
    to: DISPATCH_EMAIL,
    subject: `Urgent Ambulance Request — ${patient.name || 'Unknown Patient'}`,
    text: `URGENT AMBULANCE REQUEST\n\nRequester\n  Name: ${payload.requester?.name || 'N/A'}\n  Phone: ${payload.requester?.phone || 'N/A'}\n  Alt Phone: ${payload.requester?.altPhone || 'N/A'}\n  Relationship: ${payload.requester?.relation || 'N/A'}\n\nPatient\n  Name: ${patient.name || 'N/A'}\n  Age: ${patient.age || 'N/A'}\n  Sex: ${patient.sex || 'N/A'}\n  Weight: ${patient.weight || 'N/A'}\n  Condition / Reason: ${patient.condition || 'N/A'}\n  Current Status: ${patient.status || 'N/A'}\n\nPickup Location\n  Address: ${pickup.address || 'N/A'}\n  Landmark: ${pickup.landmark || 'N/A'}\n  City: ${pickup.city || 'N/A'}\n  Floor / Unit: ${pickup.unit || 'N/A'}\n  GPS: ${pickup.gps || 'N/A'}\n\nDestination\n  Facility: ${destination.facility || 'N/A'}\n  Address: ${destination.address || 'N/A'}\n\nService Type\n  ${payload.service || 'N/A'}\n\nMedical Requirements\n  ${requirements.length ? requirements.join('\n  ') : 'None specified'}\n\nAdditional Medical Information\n  Special Instructions: ${additional.instructions || 'N/A'}\n  Allergies: ${additional.allergies || 'N/A'}\n  Existing Conditions: ${additional.conditions || 'N/A'}\n\nEmergency Contact\n  Name: ${emergencyContact.name || 'N/A'}\n  Phone: ${emergencyContact.phone || 'N/A'}\n\nSubmitted at: ${submittedAt}`,
    html: `
      <h2>Urgent Ambulance Request</h2>
      <section>
        <h3>Requester Information</h3>
        <p><strong>Name:</strong> ${payload.requester?.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${payload.requester?.phone || 'N/A'}</p>
        <p><strong>Alternative Contact:</strong> ${payload.requester?.altPhone || 'N/A'}</p>
        <p><strong>Relationship:</strong> ${payload.requester?.relation || 'N/A'}</p>
      </section>
      <section>
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> ${patient.name || 'N/A'}</p>
        <p><strong>Age:</strong> ${patient.age || 'N/A'}</p>
        <p><strong>Sex:</strong> ${patient.sex || 'N/A'}</p>
        <p><strong>Weight:</strong> ${patient.weight || 'N/A'}</p>
        <p><strong>Condition / Reason:</strong> ${patient.condition || 'N/A'}</p>
        <p><strong>Current Status:</strong> ${patient.status || 'N/A'}</p>
      </section>
      <section>
        <h3>Pickup Location</h3>
        <p><strong>Address:</strong> ${pickup.address || 'N/A'}</p>
        <p><strong>Landmark:</strong> ${pickup.landmark || 'N/A'}</p>
        <p><strong>City:</strong> ${pickup.city || 'N/A'}</p>
        <p><strong>Floor / Unit:</strong> ${pickup.unit || 'N/A'}</p>
        <p><strong>GPS Coordinates:</strong> ${pickup.gps || 'N/A'}</p>
      </section>
      <section>
        <h3>Destination</h3>
        <p><strong>Facility:</strong> ${destination.facility || 'N/A'}</p>
        <p><strong>Address:</strong> ${destination.address || 'N/A'}</p>
      </section>
      <section>
        <h3>Service Type</h3>
        <p>${payload.service || 'N/A'}</p>
      </section>
      <section>
        <h3>Medical Requirements</h3>
        <ul>
          ${requirements.length ? requirements.map(item => `<li>${item}</li>`).join('') : '<li>None specified</li>'}
        </ul>
      </section>
      <section>
        <h3>Additional Medical Information</h3>
        <p><strong>Special Instructions:</strong> ${additional.instructions || 'N/A'}</p>
        <p><strong>Allergies:</strong> ${additional.allergies || 'N/A'}</p>
        <p><strong>Existing Conditions:</strong> ${additional.conditions || 'N/A'}</p>
      </section>
      <section>
        <h3>Emergency Contact</h3>
        <p><strong>Name:</strong> ${emergencyContact.name || 'N/A'}</p>
        <p><strong>Phone:</strong> ${emergencyContact.phone || 'N/A'}</p>
      </section>
      <p><strong>Submitted at:</strong> ${submittedAt}</p>
    `
  };
}

app.post('/api/contact', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.name || !payload.phone) {
      return res.status(400).json({error: 'Name and phone are required.'});
    }

    const mailOptions = formatContactMail(payload);
    await sendMail(mailOptions);

    res.status(200).json({message: 'Contact request sent successfully.'});
  } catch (error) {
    console.error('Contact endpoint error:', error);
    res.status(500).json({error: 'Unable to send contact request. Please try again later.'});
  }
});

app.post('/api/ambulance-request', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.requester || !payload.patient || !payload.pickup) {
      return res.status(400).json({error: 'Missing required ambulance request fields.'});
    }

    const mailOptions = formatAmbulanceRequestMail(payload);
    await sendMail(mailOptions);

    res.status(200).json({message: 'Ambulance request sent successfully.'});
  } catch (error) {
    console.error('Ambulance request endpoint error:', error);
    res.status(500).json({error: 'Unable to send ambulance request. Please try again later.'});
  }
});

app.get('/', (req, res) => {
  res.send('FOCUS Ambulance API running.');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
