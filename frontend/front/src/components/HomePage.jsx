import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function HomePage({ onNavigate, isAuthenticated }) {

{/* partners constant, mapped like below says */}
  const partners = [
    { logo: '/nucor.png'},
    { logo: '/higherlevel.png'},
  ];

  const galleryImages = ['/finch.png', '/prauner.png', '/frick.png', '/first.png','/one2.png','/table.png','/one.png'];

  const pastMeetings = [
    {
      title: 'Meet The Team',
      date: 'September 10th, 2025',
      description:
        'An introduction on CSIET where executive members outlined our vision and hosted breakout networking activities before closing with ice cream.',
      company: 'CSIET Exec',
    },
    {
      title: 'Where Sales Engineering Can Take You',
      date: 'September 23rd, 2025',
      description:
        'Local entrepreneur and Steel Hands Brewery owner Darryl Frick highlighted the breadth of opportunity that technical sales presents and how to stand out.',
      company: 'Darryl Frick',
    },
    {
      title: 'Sales Engineering @ Nucor Vulcraft',
      date: 'October 21st, 2025',
      description:
        'Members teamed up to design solutions for real structural challenges and learned how Vulcraft engineers partner with clients every day.',
      company: 'Brandon Prauner',
    },
    {
      title: 'How To: Land Tech Sales Jobs',
      date: 'November 4th, 2025',
      description:
        'A successful Tech Salesman, Auburn Engineering Graduate, and Co-Founder of Higher Levels, Eric Finch came and spoke to CSIET about landing sought after jobs. The conversation started out by learning abou  ',
      company: 'Eric Finch',
    },
  ];

  const heroHighlights = [
    {
      title: 'Industry Workshops',
      description: 'Translate complex builds into business value with partner-led prompts.',
    },
    {
      title: 'Career Support',
      description: 'Resume reviews, interview prep, and mentorship from experienced members.',
    },
    {
      title: 'Community First',
      description: 'Weekly meetups that blend technical deep dives with casual networking.',
    },
    {
      title: 'Hands-on Projects',
      description: 'Build demos and presentations you can showcase to recruiters.',
    },
  ];

  const featuredGallery = galleryImages.slice(0, 3);

  const handleDirectoryClick = () =>
    onNavigate(isAuthenticated ? 'dashboard' : 'member-login');

  return (
    <div>
      <section className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-gradient-to-b from-[#f7efe7] via-[#f9f3ec] to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6 text-center lg:text-left">
              <p className="text-sm uppercase tracking-[0.3em] text-[#733635]/80">
                Carolina Sales Institute
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-[#733635] sm:text-4xl">
                Welcome to CSIET
              </h1>
              <p className="text-base text-gray-700 sm:text-lg">
                CSIET is USC&apos;s premier organization bridging engineering and sales. We equip students to translate
                technical ideas into solutions that resonate with customers and partners.
              </p>
              <p className="text-base text-gray-700 sm:text-lg">
                Join us for hands-on workshops, industry partnerships, and a supportive community committed to helping
                you launch a career in technical sales.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  onClick={handleDirectoryClick}
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: '#733635' }}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Login to Access Dashboard'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('contact')}
                  className="border-2 bg-white hover:bg-gray-50"
                  style={{ borderColor: '#733635', color: '#733635' }}
                >
                  Talk to CSIET
                </Button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {heroHighlights.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-[#733635]/20 bg-white/80 px-4 py-3 text-left text-sm shadow-sm backdrop-blur"
                  >
                    <p className="font-semibold text-[#733635]">{item.title}</p>
                    <p className="text-gray-600">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/40 bg-[#733635] p-6 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/80">In Action</p>
              <h3 className="mt-2 text-2xl font-semibold">Scenes from recent meetings</h3>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {featuredGallery.map((image, index) => (
                  <div
                    key={image}
                    className={`overflow-hidden rounded-2xl border border-white/20 ${index === 2 ? 'col-span-2' : ''}`}
                  >
                    <img
                      src={image}
                      alt={`CSIET event ${index + 1}`}
                      className="h-40 w-full object-cover sm:h-48"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold text-[#733635]">Our Company Partners</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Trusted relationships with industry leaders give members direct access to recruiting pipelines and
            real-world problem statements.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            {partners.map((partner, index) => (
              <div
                key={`${partner.logo}-${index}`}
                className="flex h-32 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
              
              {/* section for the company partners, based on a map declared above */}
                <img
                  src={partner.logo}
                  alt={partner.name ? `${partner.name} logo` : 'Company partner logo'}
                  className="h-16 w-full object-contain"
                />
                {partner.name && (
                  <span className="text-sm font-medium text-[#733635]">{partner.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-[#733635]">What we focus on</h2>
            <p className="text-gray-700">
              From technical storytelling to relationship building, CSIET helps you translate hard-earned engineering
              knowledge into unforgettable sales conversations.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                  style={{ backgroundColor: '#ebe3d5' }}
                >
                  🎯
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>
                  Technical Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  Deep understanding of engineering principles and the ability to demonstrate tangible impact.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                  style={{ backgroundColor: '#ebe3d5' }}
                >
                  💼
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>
                  Sales Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  Practice demos, discovery questions, and relationship-building skills with peer feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                  style={{ backgroundColor: '#ebe3d5' }}
                >
                  🤝
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>
                  Industry Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  Direct access to leading companies, alumni mentors, and real client scenarios every semester.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold text-[#733635]">Meeting Gallery</h2>
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:snap-none">
            {galleryImages.map((image, index) => (
              <div key={image} className="min-w-[80%] snap-center md:min-w-0">
                <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
                  <img
                    src={image}
                    alt={`Meeting ${index + 1}`}
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-center text-2xl font-semibold text-[#733635]">Past Meetings</h2>
          <div className="mt-12 space-y-6">
            {pastMeetings.map((meeting, index) => (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: '#733635' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#733635' }}>{meeting.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 text-gray-600">
                    <span>{meeting.date}</span>
                    {meeting.company && (
                      <>
                        <span>•</span>
                        <span>{meeting.company}</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{meeting.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 text-white" style={{ backgroundColor: '#733635' }}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-4 text-lg font-semibold">CSIET</h3>
              <p>Carolina Sales Institute of Engineering and Technology</p>
              <p className="mt-2">Bridging Engineering and Sales</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Contact</h3>
              <p>University of South Carolina</p>
              <p>csiet@email.sc.edu</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Connect</h3>
              <div className="space-y-2">
                <p>
                  <a
                    href="https://www.linkedin.com/company/csiet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    LinkedIn
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.instagram.com/usc_csiet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    Instagram
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/20 pt-8 text-center">
            <p>&copy; 2025 CSIET. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
