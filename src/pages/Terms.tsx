import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EFFECTIVE_DATE = 'July 14, 2025';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <h2 className="text-lg font-semibold text-foreground mt-10 mb-3">{title}</h2>
    {children}
  </>
);

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mb-8">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or
            "your") and AgileBridge Technologies ("Company," "we," "us," or "our") governing your access to and use
            of the AgileBridge.ai platform, website, and related services (collectively, the "Service"). By
            accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must
            discontinue use immediately.
          </p>

          <Section title="1. Eligibility">
            <p>
              You must be at least eighteen (18) years of age and capable of forming a binding contract under
              applicable law to use the Service. By registering, you represent and warrant that you meet these
              eligibility requirements. If you are using the Service on behalf of an organization, you represent
              that you have the authority to bind that organization to these Terms.
            </p>
          </Section>

          <Section title="2. Account Registration & Security">
            <ul className="list-disc pl-5 space-y-1">
              <li>You must authenticate using a valid Google account via OAuth 2.0.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
              <li>You agree to notify us immediately at <span className="text-foreground font-medium">support@agilebridge.ai</span> of any unauthorized use of your account or any other security breach.</li>
              <li>We reserve the right to suspend or terminate accounts that we reasonably believe have been compromised.</li>
            </ul>
          </Section>

          <Section title="3. Description of Service">
            <p>
              AgileBridge.ai is a SaaS platform that converts legacy project management documents (including but not
              limited to Microsoft Project files, PDFs, DOCX, and CSV files) into structured agile backlogs
              consisting of Epics, User Stories, acceptance criteria, and story point estimates. The Service may also
              facilitate direct synchronization of generated backlogs to third-party project management tools such as
              Atlassian Jira.
            </p>
          </Section>

          <Section title="4. Intellectual Property">
            <p className="font-medium text-foreground">4.1 Your Content</p>
            <p>
              You retain all ownership rights in and to the documents, data, and content you upload to or generate
              through the Service ("User Content"). By uploading User Content, you grant us a limited, non-exclusive,
              revocable, royalty-free license to process, transform, and temporarily store your User Content solely
              for the purpose of providing the Service.
            </p>

            <p className="font-medium text-foreground mt-4">4.2 Our Property</p>
            <p>
              The Service, including its software, algorithms, user interface, design, documentation, trademarks,
              and all associated intellectual property, is and remains the exclusive property of AgileBridge
              Technologies. Nothing in these Terms grants you any right, title, or interest in the Service beyond
              the limited right to use it in accordance with these Terms.
            </p>

            <p className="font-medium text-foreground mt-4">4.3 Feedback</p>
            <p>
              If you provide suggestions, ideas, or feedback regarding the Service ("Feedback"), you grant us an
              irrevocable, perpetual, worldwide, royalty-free license to use, modify, and incorporate such Feedback
              into the Service without obligation or compensation to you.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any applicable local, state, national, or international law or regulation.</li>
              <li>Upload content that infringes the intellectual property rights, privacy rights, or other rights of any third party.</li>
              <li>Attempt to reverse-engineer, decompile, disassemble, or otherwise derive the source code of the Service.</li>
              <li>Introduce malicious code, viruses, or any technology that could harm the Service or its users.</li>
              <li>Use automated scripts, bots, or crawlers to access the Service without our prior written consent.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
              <li>Resell, sublicense, or redistribute the Service or any output generated by the Service without our prior written consent.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
            </ul>
            <p>
              Violation of this section may result in immediate suspension or termination of your account without
              notice or refund.
            </p>
          </Section>

          <Section title="6. Payments, Subscriptions & Refunds">
            <p className="font-medium text-foreground">6.1 Pricing</p>
            <p>
              The Service is offered under tiered pricing plans as displayed on our website. All prices are in United
              States Dollars (USD) unless otherwise stated. We reserve the right to modify pricing at any time; however,
              changes will not affect your current billing cycle.
            </p>

            <p className="font-medium text-foreground mt-4">6.2 Sprint Pass</p>
            <p>
              The Sprint Pass provides twenty-four (24) hours of access to the Service from the time of purchase.
              Sprint Pass access is non-transferable and non-renewable; a new purchase is required for additional access.
            </p>

            <p className="font-medium text-foreground mt-4">6.3 Subscriptions</p>
            <p>
              Subscription plans renew automatically at the end of each billing period (monthly or annual, as
              selected). You may cancel your subscription at any time through the Stripe Customer Portal; cancellation
              takes effect at the end of the current billing period. No partial refunds will be issued for unused
              portions of a billing period.
            </p>

            <p className="font-medium text-foreground mt-4">6.4 Refunds</p>
            <p>
              Refund requests must be submitted within seven (7) calendar days of the original transaction date to
              <span className="text-foreground font-medium"> billing@agilebridge.ai</span>. Refunds are evaluated on
              a case-by-case basis at our sole discretion. We reserve the right to deny refund requests where
              significant use of the Service has occurred during the refund period.
            </p>
          </Section>

          <Section title="7. Service Availability & Modifications">
            <p>
              We strive to maintain continuous availability of the Service but do not guarantee uninterrupted or
              error-free operation. We reserve the right to modify, suspend, or discontinue any part of the Service
              at any time, with or without notice. We shall not be liable to you or any third party for any
              modification, suspension, or discontinuation of the Service.
            </p>
          </Section>

          <Section title="8. Third-Party Integrations">
            <p>
              The Service integrates with third-party platforms including, but not limited to, Google (authentication),
              Stripe (payments), Atlassian Jira (backlog synchronization), and 1min.AI (document parsing). Your use
              of these integrations is subject to the respective third party's terms of service and privacy policy.
              We are not responsible for the availability, accuracy, or practices of any third-party service.
            </p>
          </Section>

          <Section title="9. Termination">
            <p className="font-medium text-foreground">9.1 Termination by You</p>
            <p>
              You may terminate your account at any time by contacting us at
              <span className="text-foreground font-medium"> support@agilebridge.ai</span>. Upon termination, your
              right to access the Service ceases immediately, and any outstanding fees remain payable.
            </p>

            <p className="font-medium text-foreground mt-4">9.2 Termination by Us</p>
            <p>
              We may suspend or terminate your access to the Service immediately, without prior notice or liability,
              if: (a) you breach any provision of these Terms; (b) we are required to do so by law; (c) we reasonably
              believe your account has been compromised; or (d) we discontinue the Service.
            </p>

            <p className="font-medium text-foreground mt-4">9.3 Effect of Termination</p>
            <p>
              Upon termination, all licenses and rights granted to you under these Terms terminate immediately.
              Sections 4, 10, 11, 12, 13, and 14 shall survive termination.
            </p>
          </Section>

          <Section title="10. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
              THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED.
              THE GENERATED AGILE ARTIFACTS (EPICS, USER STORIES, ACCEPTANCE CRITERIA, ESTIMATES) ARE PROVIDED AS
              SUGGESTIONS AND SHOULD BE REVIEWED AND VALIDATED BY QUALIFIED PERSONNEL BEFORE USE IN PRODUCTION
              ENVIRONMENTS.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS DIRECTORS,
              OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH: (A) YOUR ACCESS TO OR
              USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY
              ON THE SERVICE; (C) ANY USER CONTENT OBTAINED FROM THE SERVICE; OR (D) UNAUTHORIZED ACCESS, USE,
              OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT. IN NO EVENT SHALL OUR AGGREGATE LIABILITY FOR ALL
              CLAIMS RELATED TO THE SERVICE EXCEED THE GREATER OF (I) THE TOTAL AMOUNT PAID BY YOU TO US IN THE
              TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (II) ONE HUNDRED UNITED STATES DOLLARS (USD $100.00).
            </p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees,
              agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and
              expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the
              Service; (b) your violation of these Terms; (c) your violation of any rights of a third party; or
              (d) your User Content.
            </p>
          </Section>

          <Section title="13. Governing Law & Jurisdiction">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
              United States, without regard to its conflict of laws principles. Any legal action or proceeding
              arising out of or relating to these Terms shall be brought exclusively in the federal or state courts
              located in Delaware, and you consent to the personal jurisdiction of such courts.
            </p>
          </Section>

          <Section title="14. Dispute Resolution">
            <p className="font-medium text-foreground">14.1 Informal Resolution</p>
            <p>
              Before filing any formal claim, you agree to attempt to resolve disputes informally by contacting us
              at <span className="text-foreground font-medium">legal@agilebridge.ai</span>. We will attempt to
              resolve the dispute within thirty (30) days.
            </p>

            <p className="font-medium text-foreground mt-4">14.2 Binding Arbitration</p>
            <p>
              If informal resolution fails, any dispute, controversy, or claim arising out of or relating to these
              Terms shall be resolved by binding arbitration administered by the American Arbitration Association
              ("AAA") under its Commercial Arbitration Rules. The arbitration shall be conducted in English, and
              the seat of arbitration shall be Wilmington, Delaware. The arbitrator's decision shall be final and
              binding and may be entered as a judgment in any court of competent jurisdiction.
            </p>

            <p className="font-medium text-foreground mt-4">14.3 Class Action Waiver</p>
            <p>
              YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND
              NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU EXPRESSLY WAIVE YOUR RIGHT TO PARTICIPATE
              IN A CLASS ACTION OR SEEK RELIEF ON A CLASS-WIDE BASIS.
            </p>
          </Section>

          <Section title="15. General Provisions">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and the Company regarding the Service and supersede all prior agreements.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign or transfer your rights under these Terms without our prior written consent. We may assign our rights without restriction.</li>
              <li><strong>Force Majeure:</strong> We shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, war, terrorism, cyberattacks, government action, or infrastructure failures.</li>
              <li><strong>Notices:</strong> We may provide notices to you via email to the address associated with your account. You may provide notices to us at <span className="text-foreground font-medium">legal@agilebridge.ai</span>.</li>
            </ul>
          </Section>

          <Section title="16. Changes to These Terms">
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email
              or a prominent notice on the Service at least fifteen (15) days prior to taking effect. Your continued
              use of the Service after the effective date of revised Terms constitutes your acceptance of the changes.
              If you do not agree to the revised Terms, you must discontinue use of the Service.
            </p>
          </Section>

          <Section title="17. Contact">
            <p>
              For questions or concerns regarding these Terms, please contact us at:
            </p>
            <p className="text-foreground font-medium">
              AgileBridge Technologies<br />
              Email: legal@agilebridge.ai
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
