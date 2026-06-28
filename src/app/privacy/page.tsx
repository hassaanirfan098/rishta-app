import { LegalPage, Clause } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy — Rishta",
  description:
    "How Rishta collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="27 June 2026">
      <Clause heading="Our commitment">
        <p>
          Your privacy is central to Rishta. Marriage is a deeply personal matter, and
          we treat your information with the care and discretion it deserves. This
          policy explains what we collect, why, and the control you have.
        </p>
      </Clause>

      <Clause heading="1. Information we collect">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Profile details</strong> you provide — name, age, gender, location,
            faith and sect, education, profession, family values, photos, and your
            "about me".
          </li>
          <li>
            <strong>Account information</strong> — email address or phone number used to
            sign in.
          </li>
          <li>
            <strong>Activity</strong> — likes, matches, and messages exchanged with other
            members.
          </li>
          <li>
            <strong>Technical data</strong> — device and basic usage information needed to
            run the Service securely.
          </li>
        </ul>
      </Clause>

      <Clause heading="2. How we use your information">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To create your profile and show you relevant matches.</li>
          <li>To enable communication once you and another member match.</li>
          <li>To verify profiles and keep the community safe.</li>
          <li>To process payments for premium features.</li>
          <li>To send you notifications about matches and messages.</li>
        </ul>
      </Clause>

      <Clause heading="3. What stays private">
        <p>
          Your contact details (such as your phone number) are never shown to other
          members unless you explicitly choose to share them. Photos are visible only
          within the platform to verified members, and you control which photos appear.
          We never sell your personal information to third parties.
        </p>
      </Clause>

      <Clause heading="4. Who can see your profile">
        <p>
          Only verified, approved members can browse profiles. Free members see limited
          previews of who liked them; full visibility is a Gold feature. You can report
          or block any member at any time, which removes you from their view.
        </p>
      </Clause>

      <Clause heading="5. Data storage & security">
        <p>
          Your data is stored securely with industry-standard encryption in transit and
          at rest through our infrastructure providers. Access is restricted to
          authorised personnel for the purpose of operating and moderating the Service.
        </p>
      </Clause>

      <Clause heading="6. Your rights">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Access and update your information any time from Settings.</li>
          <li>Delete your account, which permanently removes your profile and data.</li>
          <li>Control your photos, contact sharing, and notification preferences.</li>
        </ul>
      </Clause>

      <Clause heading="7. Cookies">
        <p>
          We use essential cookies to keep you signed in and to operate the Service. We
          do not use cookies for third-party advertising.
        </p>
      </Clause>

      <Clause heading="8. Children">
        <p>
          Rishta is strictly for adults aged 18 and over. We do not knowingly collect
          information from anyone under 18.
        </p>
      </Clause>

      <Clause heading="9. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes, and continued use indicates acceptance.
        </p>
      </Clause>
    </LegalPage>
  );
}
