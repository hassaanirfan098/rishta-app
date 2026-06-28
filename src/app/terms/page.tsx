import { LegalPage, Clause } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service — Rishta",
  description: "The terms governing your use of the Rishta matrimonial platform.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="27 June 2026">
      <Clause heading="1. Acceptance of Terms">
        <p>
          By creating an account or using Rishta ("the Service"), you agree to be
          bound by these Terms of Service. If you do not agree, please do not use the
          Service. Rishta is a matrimonial platform intended solely to help
          marriage-minded adults find a spouse in accordance with Islamic values.
        </p>
      </Clause>

      <Clause heading="2. Eligibility">
        <p>
          You must be at least 18 years old and legally permitted to marry to use
          Rishta. By using the Service you represent that all information you provide
          is truthful and that you are genuinely seeking marriage. Rishta is not a
          dating or casual-relationship service.
        </p>
      </Clause>

      <Clause heading="3. Account & Verification">
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account. Every profile is
          subject to manual review and may be approved, declined, or removed at our
          discretion to protect the community. You agree not to impersonate any
          person or misrepresent your identity, marital status, or intentions.
        </p>
      </Clause>

      <Clause heading="4. Acceptable Conduct">
        <p>You agree that you will not:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Harass, abuse, threaten, or harm another member.</li>
          <li>Share another member's private information or photos without consent.</li>
          <li>Use the Service for any unlawful, fraudulent, or commercial purpose.</li>
          <li>Post content that is obscene, hateful, or contrary to Islamic values.</li>
          <li>Create multiple or fake accounts, or use bots and automated tools.</li>
        </ul>
        <p>
          Violations may result in immediate suspension or permanent removal without
          refund.
        </p>
      </Clause>

      <Clause heading="5. Payments & Subscriptions">
        <p>
          Certain features — such as Gold membership, contact unlocks, and bundles —
          require payment. Prices are shown in Pakistani Rupees and processed securely
          through our payment partner. Subscriptions renew according to the plan you
          select. Except where required by law, payments are non-refundable. We may
          change pricing with reasonable notice.
        </p>
      </Clause>

      <Clause heading="6. Privacy">
        <p>
          Your use of the Service is also governed by our Privacy Policy, which
          explains how we collect, use, and protect your information. Your photos and
          contact details remain private until you choose to share them.
        </p>
      </Clause>

      <Clause heading="7. Disclaimer">
        <p>
          Rishta provides a platform to connect members but does not conduct
          background checks beyond profile review and does not guarantee the conduct,
          identity, or intentions of any member. You interact with other members at
          your own discretion and risk. Always involve your family (wali) and exercise
          caution.
        </p>
      </Clause>

      <Clause heading="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Rishta shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the
          Service, including interactions with other members.
        </p>
      </Clause>

      <Clause heading="9. Termination">
        <p>
          You may delete your account at any time from Settings. We may suspend or
          terminate your access if you breach these Terms or to protect the community.
        </p>
      </Clause>

      <Clause heading="10. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service
          after changes take effect constitutes acceptance of the revised Terms.
        </p>
      </Clause>
    </LegalPage>
  );
}
