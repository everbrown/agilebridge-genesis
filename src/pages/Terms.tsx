import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>By using AgileBridge.ai ("Service"), you agree to these terms. If you do not agree, do not use the Service.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Use of Service</h2>
          <p>AgileBridge converts legacy project documents into agile backlogs. You retain ownership of all content you upload and generate.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Accounts</h2>
          <p>You must sign in with a valid Google account. You are responsible for maintaining the security of your account.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Payments & Refunds</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sprint Pass provides 24-hour access from the time of purchase.</li>
            <li>Subscriptions renew automatically and can be cancelled at any time.</li>
            <li>Refunds are handled on a case-by-case basis within 7 days of purchase.</li>
          </ul>
          <h2 className="text-lg font-semibold text-foreground mt-8">Limitation of Liability</h2>
          <p>The Service is provided "as is." We are not liable for any damages arising from your use of the Service.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Contact</h2>
          <p>Questions? Reach us at <span className="text-foreground font-medium">support@agilebridge.ai</span></p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
