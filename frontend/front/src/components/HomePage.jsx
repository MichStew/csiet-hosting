import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';


export default function HomePage({ onNavigate }) {
  const partners = [
    { name: 'Microsoft', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Microsoft' },
    { name: 'IBM', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=IBM' },
    { name: 'Salesforce', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Salesforce' },
    { name: 'Oracle', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Oracle' },
    { name: 'SAP', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=SAP' },
    { name: 'Cisco', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Cisco' },
    { name: 'Dell', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Dell' },
    { name: 'HP Enterprise', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=HPE' },
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjB0ZWFtfGVufDF8fHx8MTc2MTExODUwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1590650046871-92c887180603?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBuZXR3b3JraW5nfGVufDF8fHx8MTc2MTA1NzgyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1753162658596-2ccba5e4246a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdvcmtzaG9wfGVufDF8fHx8MTc2MTE1NDg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1709715357564-ab64e091ead9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzYxMTI5MzY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbmZlcmVuY2V8ZW58MXx8fHwxNzYxMTM4Nzk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nfGVufDF8fHx8MTc2MTA2ODgyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1760840159368-f4efb448f756?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzZW1pbmFyfGVufDF8fHx8MTc2MTE1NDg3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ];

  const pastMeetings = [
    {
      title: 'Technical Sales Workshop with Microsoft',
      date: 'October 15, 2025',
      description: 'Learn how to effectively communicate technical solutions to non-technical stakeholders. Microsoft sales engineers shared their expertise in translating complex cloud architectures into business value.',
      company: 'Microsoft'
    },
    {
      title: 'Networking Night with Industry Leaders',
      date: 'September 28, 2025',
      description: 'An evening of networking with sales engineers from top tech companies. Members had the opportunity to practice their elevator pitches and receive feedback from professionals.',
      company: 'Various Companies'
    },
    {
      title: 'Solution Design Challenge',
      date: 'September 10, 2025',
      description: 'Teams competed to design the best technical solution for a real-world business problem. Judges from IBM and Salesforce evaluated presentations on both technical merit and business value.',
      company: 'IBM & Salesforce'
    },
    {
      title: 'Career Panel: Paths in Sales Engineering',
      date: 'August 30, 2025',
      description: 'A panel of USC alumni working in sales engineering discussed their career journeys, daily responsibilities, and tips for landing your first role in the field.',
      company: 'Alumni Panel'
    },
    {
      title: 'Welcome Back Meeting',
      date: 'August 20, 2025',
      description: 'Kicked off the fall semester with team building activities, club introductions, and an overview of exciting events planned for the year. New members learned about CSIET\'s mission and goals.',
      company: 'CSIET'
    }
  ];

  return (
    <div>
      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12" style={{ color: '#733635' }}>Our Company Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <ImageWithFallback
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-20 object-contain"
                />
                <span className="text-center" style={{ color: '#733635' }}>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-center mb-4" style={{ color: '#733635' }}>Welcome to CSIET</h1>
          <h2 className="text-center mb-8" style={{ color: '#733635' }}>Carolina Sales Institute of Engineering and Technology</h2>
          
          <div className="space-y-6 mb-12">
            <p className="text-center text-lg">
              CSIET is USC's premier organization bridging engineering and sales. We are dedicated to developing the next generation of technical sales professionals who can seamlessly translate complex engineering concepts into compelling business solutions.
            </p>
            <p className="text-center text-lg">
              Our mission is to equip students with both technical excellence and professional sales skills through hands-on workshops, industry partnerships, and networking opportunities. Whether you're an engineering student interested in the business side or looking to combine technical knowledge with client-facing roles, CSIET is your community.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <Button 
              onClick={() => onNavigate('member-directory')}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#733635' }}
            >
              View Member Directory
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: '#ebe3d5' }}>
                  🎯
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>Technical Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Deep understanding of engineering principles and technical solutions</p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: '#ebe3d5' }}>
                  💼
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>Sales Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Professional sales techniques and relationship-building skills</p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#733635' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: '#ebe3d5' }}>
                  🤝
                </div>
                <CardTitle className="text-center" style={{ color: '#733635' }}>Industry Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">Direct access to leading companies and industry professionals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meeting Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12" style={{ color: '#733635' }}>Meeting Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group">
                <ImageWithFallback
                  src={image}
                  alt={`Meeting ${index + 1}`}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meeting History */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-center mb-12" style={{ color: '#733635' }}>Past Meetings</h2>
          <div className="space-y-6">
            {pastMeetings.map((meeting, index) => (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: '#733635' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#733635' }}>{meeting.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
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

      {/* Footer */}
      <footer className="py-12 text-white" style={{ backgroundColor: '#733635' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="mb-4">CSIET</h3>
              <p>Carolina Sales Institute of Engineering and Technology</p>
              <p className="mt-2">Bridging Engineering and Sales</p>
            </div>
            <div>
              <h3 className="mb-4">Contact</h3>
              <p>University of South Carolina</p>
              <p>csiet@email.sc.edu</p>
            </div>
            <div>
              <h3 className="mb-4">Connect</h3>
              <div className="space-y-2">
                <p>LinkedIn</p>
                <p>Instagram</p>
                <p>Twitter</p>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/20">
            <p>&copy; 2025 CSIET. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

