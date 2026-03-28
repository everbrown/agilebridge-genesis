import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

const EFFECTIVE_DATE = 'March 25, 2026';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <h2 className="text-lg font-semibold text-foreground mt-10 mb-3">{title}</h2>
    {children}
  </>
);

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <BrandLogo size="sm" />
        </div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mb-8">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>
            AgileBridge.ai, operated by AgileBridge Technologies ("Company," "we," "us," or "our"), is committed to
            protecting the privacy and security of your personal information. This Privacy Policy describes how we
            collect, use, disclose, retain, and safeguard information when you access or use the AgileBridge.ai
            platform, website, and related services (collectively, the "Service"). By accessing or using the Service,
            you acknowledge that you have read and understood this Privacy Policy.
          </p>

          <Section title="1. Information We Collect">
            <p className="font-medium text-foreground">1.1 Information You Provide Directly</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> When you register via Google OAuth, we receive your name, email address, and profile picture from your Google account.</li>
              <li><strong>Documents:</strong> Project files (MPP, PDF, DOCX, CSV) that you upload for conversion into agile backlogs.</li>
              <li><strong>Payment Information:</strong> Billing details processed and stored exclusively by our payment processor, Stripe, Inc. We do not store credit card numbers, CVVs, or full payment card data on our servers.</li>
              <li><strong>Communications:</strong> Any information you provide when you contact our support team or respond to surveys.</li>
            </ul>

            <p className="font-medium text-foreground mt-4">1.2 Information Collected Automatically</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Usage Data:</strong> Pages visited, features used, session duration, click patterns, and interaction events.</li>
              <li><strong>Device & Browser Information:</strong> IP address, browser type and version, operating system, device identifiers, and screen resolution.</li>
              <li><strong>Log Data:</strong> Server logs that record requests, timestamps, referring URLs, and response codes.</li>
            </ul>

            <p className="font-medium text-foreground mt-4">1.3 Cookies & Similar Technologies</p>
            <p>
              We use cookies, local storage, and similar tracking technologies to maintain your session, remember your
              preferences, and analyze usage patterns. The categories of cookies we use include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Strictly Necessary Cookies:</strong> Required for authentication, session management, and security. These cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service so we can improve functionality and performance.</li>
              <li><strong>Preference Cookies:</strong> Store your settings such as theme and display preferences.</li>
            </ul>
            <p>
              You may control cookie preferences through your browser settings. Disabling certain cookies may impair
              Service functionality.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Delivery:</strong> To provide, operate, maintain, and improve the AgileBridge platform, including document parsing, backlog generation, and Jira integration.</li>
              <li><strong>Payment Processing:</strong> To process transactions, manage subscriptions, and administer billing through Stripe.</li>
              <li><strong>Communications:</strong> To send transactional emails (e.g., receipts, account notifications) and, where you have opted in, product updates and marketing communications.</li>
              <li><strong>Security & Fraud Prevention:</strong> To detect, prevent, and respond to security incidents, fraud, and abuse.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
              <li><strong>Analytics & Improvement:</strong> To analyze usage trends, diagnose technical issues, and develop new features.</li>
            </ul>
          </Section>

          <Section title="3. Third-Party Services & Data Sharing">
            <p>
              We do not sell, rent, or trade your personal information. We share data only with the following
              categories of third-party service providers, each bound by contractual obligations to protect your data:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google (OAuth):</strong> Authentication and identity verification.</li>
              <li><strong>Stripe, Inc.:</strong> Payment processing, subscription management, and billing. Stripe's privacy policy governs its handling of payment data.</li>
              <li><strong>1min.AI:</strong> Document parsing and AI-powered content extraction. Documents are transmitted via encrypted connection and processed transiently.</li>
              <li><strong>Atlassian (Jira Cloud):</strong> When you initiate a Jira sync, your generated backlog data is transmitted to your designated Jira instance using credentials you provide.</li>
              <li><strong>Hosting & Infrastructure:</strong> Cloud infrastructure providers that host the Service and store account data under industry-standard security measures.</li>
            </ul>
            <p>
              We may also disclose information if required by law, court order, or governmental regulation, or if
              disclosure is necessary to protect the rights, property, or safety of the Company, our users, or the public.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Uploaded Documents:</strong> Processed in-memory or in ephemeral compute environments. Documents are not persisted to permanent storage and are purged upon completion of processing or session termination.</li>
              <li><strong>Account Data:</strong> Retained for the duration of your active account. Upon account deletion, personal data is purged within thirty (30) calendar days, except where retention is required by law.</li>
              <li><strong>Payment Records:</strong> Transaction records are retained as required by applicable tax and financial regulations.</li>
              <li><strong>Aggregated & Anonymized Data:</strong> De-identified, aggregated data may be retained indefinitely for analytics and product improvement purposes.</li>
            </ul>
          </Section>

          <Section title="5. Your Rights & Choices">
            <p>
              Depending on your jurisdiction, you may have the following rights with respect to your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete personal data.</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data, subject to legal retention obligations.</li>
              <li><strong>Restriction:</strong> Request that we limit the processing of your personal data under certain circumstances.</li>
              <li><strong>Portability:</strong> Request a machine-readable copy of your personal data for transfer to another service.</li>
              <li><strong>Objection:</strong> Object to the processing of your personal data for direct marketing purposes.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <span className="text-foreground font-medium">privacy@agilebridge.ai</span>.
              We will respond within thirty (30) days of receipt of a verifiable request.
            </p>
          </Section>

          <Section title="6. International Data Transfers">
            <p>
              The Service is operated from the United States. If you access the Service from outside the United States,
              your information may be transferred to, stored, and processed in the United States or other jurisdictions
              where our service providers operate. Such transfers are conducted in compliance with applicable data
              protection laws, including, where applicable, the use of Standard Contractual Clauses (SCCs) approved
              by the European Commission or other legally recognized transfer mechanisms.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p>
              We implement industry-standard administrative, technical, and physical safeguards to protect your
              personal information, including encryption in transit (TLS 1.2+), encryption at rest, access controls,
              and regular security assessments. However, no method of electronic transmission or storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The Service is not directed to individuals under the age of thirteen (13), or under the age of sixteen
              (16) in the European Economic Area. We do not knowingly collect personal information from children. If
              we become aware that we have collected personal data from a child without verifiable parental consent,
              we will take steps to delete such information promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email
              or a prominent notice on the Service at least fifteen (15) days prior to the changes taking effect. Your
              continued use of the Service after the effective date of any revised policy constitutes acceptance of
              the updated terms.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <p className="text-foreground font-medium">
              AgileBridge Technologies<br />
              Email: privacy@agilebridge.ai
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
