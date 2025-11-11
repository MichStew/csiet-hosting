import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';


export default function HomePage({ onNavigate, isAuthenticated }) {
  const partners = [
    { logo: '/nucor.png' },
    { logo: 'higherlevelscrop.png' }
    
    /*
    { name: 'Salesforce', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Salesforce' },
    { name: 'Oracle', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Oracle' },
    { name: 'SAP', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=SAP' },
    { name: 'Cisco', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Cisco' },
    { name: 'Dell', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=Dell' },
    { name: 'HP Enterprise', logo: 'https://via.placeholder.com/150x80/733635/FFFFFF?text=HPE' }, */
  ];
  
/*can be changed, useful to have everything in one place */
  const galleryImages = [
    'finch.png',
    'prauner.png',
    'frick.png',
    'first.png'
  ];

  const pastMeetings = [
    {
      title: 'Meet The Team',
      date: 'October 15, 2025',
      description: 'An introduction on CSIET. The exceutive members got up and spoke about our vision for this club. Who we are, what we want to achieve, and how we want to do it. After our introduction we broke into groups with icebreakers to network, and finally ended the night with some ice cream. ',
      company: 'CSIET Exec'
    },
    {
      title: 'Where Sales Engineering Can Take You',
      date: 'September 28, 2025',
      description: 'A prominent figure in the columbia area and owner of steel hands brewery came and spoke to our members about the success that sales engineering can bring you. His experience ',
      company: 'Darryl Frick'
    },
    {
      title: 'Sales Engineering @ Nucor Vulcraft',
      date: 'September 10, 2025',
      description: 'Teams competed to design the best technical solution for a real-world business problem. Judges from IBM and Salesforce evaluated presentations on both technical merit and business value.',
      company: 'Brandon Prauner'
    },
    {
      title: 'How To: Land Tech Sales Jobs',
      date: 'August 30, 2025',
      description: 'A panel of USC alumni working in sales engineering discussed their career journeys, daily responsibilities, and tips for landing your first role in the field.',
      company: 'Eric Finch'
    }/*
    {
      title: 'Welcome Back Meeting',
      date: 'August 20, 2025',
      description: 'Kicked off the fall semester with team building activities, club introductions, and an overview of exciting events planned for the year. New members learned about CSIET\'s mission and goals.',
      company: ''
    } */
  ];
  /*const cardBackground = '#f9f0e8'; */

  return (
    <div>
    
      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12" style={{ color: '#733635' }}>Our Company Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
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

          <div className="flex flex-col items-center gap-2 mb-12">
            <Button 
              onClick={() => onNavigate(isAuthenticated ? 'member-directory' : 'member-login')}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#733635' }}
            >
              {isAuthenticated ? 'View Member Directory' : 'Login to View Directory'}
            </Button>
            {!isAuthenticated && (
              <p className="text-sm text-gray-600">
                Club membership login required to browse the directory.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2" style={{ borderColor: '#733635'}}>
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

            <Card className="border-2" style={{ borderColor: '#733635'}}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group">
                <img
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
              <Card
                key={index}
                className="border-l-4"
                style={{ borderLeftColor: '#733635'}}
              >
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
              
               <p> <a href=
                {"https://www.linkedin.com/company/csiet"} 
                target={"blank"}> LinkedIn </a> </p>
               
               <p>< a href={'https://www.instagram.com/usc_csiet/'}
               target={'blank'}> Instagram </a> </p>
            
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
