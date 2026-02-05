export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">
              About Nirmal Setu
            </span>
          </h1>
          <p className="text-xl text-gray-400">Revolutionizing Urban Waste Management</p>
        </div>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">What We Do</h2>
          <p className="mb-6 leading-relaxed text-gray-300">
            Nirmal Setu is an AI-powered platform that connects citizens, municipal bodies, and
            technology to transform waste management across cities. We use artificial intelligence,
            community engagement, and innovative solutions to create cleaner, healthier urban
            environments.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-700 p-6">
              <h3 className="mb-2 text-lg font-semibold text-cyan-400">Smart Complaint System</h3>
              <p className="text-sm text-gray-300">
                AI-powered issue detection with image recognition and automatic categorization.
                Citizens earn points for proactive reporting.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 p-6">
              <h3 className="mb-2 text-lg font-semibold text-green-400">Intelligent Dashboard</h3>
              <p className="text-sm text-gray-300">
                Real-time analytics and predictive insights with ShuchiAI conversational assistant
                for data-driven decisions.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 p-6">
              <h3 className="mb-2 text-lg font-semibold text-emerald-400">
                Administrative Excellence
              </h3>
              <p className="text-sm text-gray-300">
                Advanced admin console with AI-assisted prioritization and automated workflows to
                boost resolution rates.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 p-6">
              <h3 className="mb-2 text-lg font-semibold text-orange-400">Gamified Learning</h3>
              <p className="text-sm text-gray-300">
                Interactive waste segregation training with AR experiences and community challenges
                for environmental education.
              </p>
            </div>
          </div>
        </section>

        {/* Impact */}
        {/* <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">Our Impact</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-cyan-400">50+</div>
              <div className="text-sm text-gray-400">Cities Connected</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-green-400">10K+</div>
              <div className="text-sm text-gray-400">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-emerald-400">25M+</div>
              <div className="text-sm text-gray-400">Coverage Area</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-orange-400">&lt;2h</div>
              <div className="text-sm text-gray-400">Response Time</div>
            </div>
          </div>
        </section> */}

        {/* Mission & Vision */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Our Mission & Vision</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-cyan-400">Mission</h3>
              <p className="leading-relaxed text-gray-300">
                To revolutionize urban waste management by leveraging AI, community engagement, and
                innovative technology. We believe clean cities are about creating sustainable,
                healthy environments where citizens actively participate in their community's
                well-being.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-green-400">Vision</h3>
              <p className="leading-relaxed text-gray-300">
                A world where every city is clean, sustainable, and technologically empowered. Where
                citizens are active participants in their community's well-being, and municipal
                services are efficient, transparent, and responsive.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'About Nirmal Setu',
  description: 'About Nirmal Setu'
};
