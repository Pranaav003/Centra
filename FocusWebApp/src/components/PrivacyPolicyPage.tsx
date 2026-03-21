import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { SEO } from './SEO';
import { ArrowLeft } from 'lucide-react';

/** Keep in sync with legal / store listings */
const EFFECTIVE_DATE = 'January 26, 2026';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | Centra"
        description="Privacy Policy for Centra — how we collect, use, and protect your data for our productivity Chrome extension and web app."
        keywords="Centra privacy policy, data protection, Chrome extension privacy"
      />
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <article className="max-w-none text-gray-300">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Privacy Policy for Centra
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mb-10">
              <strong className="text-gray-300">Effective Date:</strong> {EFFECTIVE_DATE}
            </p>

            <p className="text-gray-300 leading-relaxed mb-8">
              Centra is a productivity-focused Chrome extension designed to help users block
              distracting websites.
            </p>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Centra does not collect or store personal data such as names, emails, or passwords
                directly within the extension. Any user account data is handled securely through our
                backend services.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">We may store:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>User preferences (e.g., blocked websites)</li>
                <li>Basic usage settings</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                This data is stored locally in the browser or securely on our servers.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Information</h2>
              <p className="text-gray-300 leading-relaxed mb-3">We use stored data only to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-6">
                <li>Enable website blocking functionality</li>
                <li>Save user preferences</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mb-3">We do NOT:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Sell user data</li>
                <li>Track browsing history outside of blocking functionality</li>
                <li>Share personal data with third parties</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">Permissions</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Centra requests permissions such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                <li>
                  <strong className="text-white">tabs:</strong> to detect active websites
                </li>
                <li>
                  <strong className="text-white">storage:</strong> to save user preferences
                </li>
                <li>
                  <strong className="text-white">host permissions:</strong> to block selected sites
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                These are used strictly for core functionality.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed">
                Centra may use third-party services (e.g., Stripe, MongoDB, Resend) to support
                payments and backend functionality.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We take reasonable measures to protect user data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions, contact:{' '}
                <a
                  href="mailto:dev@pranaaviyer.com"
                  className="text-primary hover:underline"
                >
                  dev@pranaaviyer.com
                </a>
              </p>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
