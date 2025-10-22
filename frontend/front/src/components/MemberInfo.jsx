import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, FileText } from 'lucide-react';

export default function MemberInfo({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const members = [
    {
      name: 'Emily Johnson',
      email: 'ejohnson@email.sc.edu',
      year: 'Junior',
      major: 'Mechanical Engineering',
      interests: ['Product Design', 'Sales Strategy', 'Leadership']
    },
    {
      name: 'Michael Chen',
      email: 'mchen@email.sc.edu',
      year: 'Senior',
      major: 'Computer Science',
      interests: ['Software Sales', 'AI/ML', 'Entrepreneurship']
    },
    {
      name: 'Sarah Martinez',
      email: 'smartinez@email.sc.edu',
      year: 'Sophomore',
      major: 'Industrial Engineering',
      interests: ['Process Optimization', 'Client Relations', 'Data Analytics']
    },
    {
      name: 'David Thompson',
      email: 'dthompson@email.sc.edu',
      year: 'Senior',
      major: 'Electrical Engineering',
      interests: ['Technical Sales', 'IoT Solutions', 'Networking']
    },
    {
      name: 'Jessica Williams',
      email: 'jwilliams@email.sc.edu',
      year: 'Junior',
      major: 'Chemical Engineering',
      interests: ['Pharmaceuticals', 'Business Development', 'Research']
    },
    {
      name: 'Ryan Anderson',
      email: 'randerson@email.sc.edu',
      year: 'Sophomore',
      major: 'Civil Engineering',
      interests: ['Infrastructure', 'Project Management', 'Sustainability']
    },
    {
      name: 'Ashley Brown',
      email: 'abrown@email.sc.edu',
      year: 'Junior',
      major: 'Biomedical Engineering',
      interests: ['Medical Devices', 'Healthcare Tech', 'Innovation']
    },
    {
      name: 'Christopher Lee',
      email: 'clee@email.sc.edu',
      year: 'Senior',
      major: 'Computer Engineering',
      interests: ['Hardware Sales', 'Cybersecurity', 'Cloud Computing']
    },
    {
      name: 'Amanda Garcia',
      email: 'agarcia@email.sc.edu',
      year: 'Sophomore',
      major: 'Aerospace Engineering',
      interests: ['Aviation', 'Defense Systems', 'Supply Chain']
    },
    {
      name: 'Brandon Taylor',
      email: 'btaylor@email.sc.edu',
      year: 'Junior',
      major: 'Materials Science',
      interests: ['Manufacturing', 'Quality Control', 'Innovation']
    }
  ];

  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.major.toLowerCase().includes(query) ||
      member.year.toLowerCase().includes(query) ||
      member.interests.some(interest => interest.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe3d5' }}>
      {/* Header */}
      <div className="py-8 px-4" style={{ backgroundColor: '#733635' }}>
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-white text-center mb-2">Member Directory</h1>
          <p className="text-white/80 text-center">Search and connect with CSIET members</p>
        </div>
      </div>

      {/* Search and Results */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, major, year, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
          <p className="mt-4 text-center text-gray-600">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
          </p>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }}>{member.name}</CardTitle>
                <p className="text-sm text-gray-600">{member.email}</p>
                <Badge 
                  variant="outline" 
                  className="w-fit mt-2"
                  style={{ borderColor: '#733635', color: '#733635' }}
                >
                  {member.year}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">{member.major}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest, i) => (
                        <Badge 
                          key={i}
                          className="text-xs"
                          style={{ 
                            backgroundColor: 'rgba(115, 54, 53, 0.1)', 
                            color: '#733635',
                            border: 'none'
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a 
                    href={`/resumes/${member.name.replace(' ', '_')}.pdf`}
                    className="flex items-center gap-2 text-sm hover:underline mt-4"
                    style={{ color: '#733635' }}
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No members found matching your search.</p>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

