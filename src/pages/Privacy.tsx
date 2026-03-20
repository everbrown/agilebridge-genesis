import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>AgileBridge.ai ("we", "us") respects your privacy. This policy explains how we collect, use, and protect your information when you use our service.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (email address via Google OAuth)</li>
            <li>Documents you upload for processing (not stored permanently)</li>
            <li>Payment information (processed securely by Stripe)</li>
            <li>Usage data and analytics</li>
          </ul>
          <h2 className="text-lg font-semibold text-foreground mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the AgileBridge service</li>
            <li>To process payments and manage your subscription</li>
            <li>To send product updates (if you opted in)</li>
          </ul>
          <h2 className="text-lg font-semibold text-foreground mt-8">Data Retention</h2>
          <p>Uploaded documents are processed in-memory and are not stored on our servers. Account data is retained while your account is active.</p>
          <h2 className="text-lg font-semibold text-foreground mt-8">Contact</h2>
          <p>Questions? Reach us at <span className="text-foreground font-medium">support@agilebridge.ai</span></p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
