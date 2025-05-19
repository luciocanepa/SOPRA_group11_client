export default function PrivacyPolicyPage() {
    return (
      <main className="max-w-3xl mx-auto p-8 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
  
        <p><strong>Effective Date:</strong> 19.05.2025</p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
        <p>
        This Pomodoro Timer Web Application (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) was created as part of a university project. Our main goal is to help students coordinate shared study sessions using a Pomodoro timer and Google Calendar integration.

We value your privacy and are committed to protecting your personal information. This Privacy Policy describes what data we access, how we use it, and your choices.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">2. What Data We Access</h2>
        <p>
          We request access only to your Google Calendar, using the following scope:
          <code className="block bg-gray-100 p-2 mt-2">https://www.googleapis.com/auth/calendar</code>
          This permission allows us to create calendar events on your behalf.
We do not access:

Your name
Your email
Your profile picture
Your contacts
Any other Google services

        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">3. How We Use Your Data</h2>
        <p>
          When you schedule a study session through our app,

We store the same event details (title, date, time, description) in our own database for use inside the app
We do not read or sync any other events from your Google Calendar.

All session planning and group activity is shown based on data stored on our own servers.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Storage and Security</h2>
        <p>
        Your access token is stored only temporarily during your session
We do not permanently store access tokens or Google Calendar data
All stored session information is protected using standard security practices
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Sharing Your Information</h2>
        <p>
        We do not sell, share, or transmit your data to third parties.
        All data access is strictly for study session management within the app.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Choices</h2>
        <p>
        You can revoke calendar access at any time via your Google Account settings
        You may continue to use timer and group features without calendar integration
                </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
        <p>
          For questions about privacy, please contact:<br />
          sharon00kelly@gmail.com
        </p>
      </main>
    );
  }
  