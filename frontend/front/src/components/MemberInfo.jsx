import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, ChevronsUpDown, FileText, Search } from 'lucide-react';

export default function MemberInfo({ onNavigate, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const dropdownRef = useRef(null);

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

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      if (!query) return true;
      return (
        member.name.toLowerCase().includes(query) ||
        member.major.toLowerCase().includes(query) ||
        member.year.toLowerCase().includes(query) ||
        member.interests.some((interest) => interest.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const activeMember =
    selectedMember && filteredMembers.some((m) => m.email === selectedMember.email)
      ? selectedMember
      : filteredMembers[0] || null;

  useEffect(() => {
    if (!isDropdownOpen) {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchQuery(member.name);
    setIsDropdownOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#ebe3d5' }}>
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-2xl font-semibold" style={{ color: '#733635' }}>
            Please sign in to view the member directory
          </h2>
          <p className="text-gray-600">
            Your session expired or you navigated here directly. Log in again to securely access member profiles.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => onNavigate('member-login')} style={{ backgroundColor: '#733635', color: 'white' }}>
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => onNavigate('home')}>
              Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-white/80 text-center">Welcome back, {user.name}</p>
        </div>
      </div>

      {/* Search and Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8" ref={dropdownRef}>
          <p className="mb-2 text-center text-gray-600">
            Select a member to view their details
          </p>
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal bg-white"
              style={{ borderColor: '#733635', color: '#733635' }}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span>
                {activeMember ? activeMember.name : 'No members available'}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
            {isDropdownOpen && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
                <div className="p-3 border-b flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <button
                        key={member.email}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col"
                        onClick={() => handleSelectMember(member)}
                      >
                        <span className="font-medium" style={{ color: '#733635' }}>
                          {member.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {member.major} • {member.year}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No members match “{searchQuery}”
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {activeMember ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }} className="text-3xl">
                  {activeMember.name}
                </CardTitle>
                <p className="text-gray-600">{activeMember.email}</p>
                <Badge
                  variant="outline"
                  className="w-fit mt-2"
                  style={{ borderColor: '#733635', color: '#733635' }}
                >
                  {activeMember.year}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500">
                      Major
                    </p>
                    <p className="text-lg">{activeMember.major}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeMember.interests.map((interest) => (
                        <Badge
                          key={interest}
                          className="text-xs"
                          style={{
                            backgroundColor: 'rgba(115, 54, 53, 0.1)',
                            color: '#733635',
                            border: 'none',
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a
                    href={`/resumes/${activeMember.name.replace(' ', '_')}.pdf`}
                    className="inline-flex items-center gap-2 text-sm hover:underline"
                    style={{ color: '#733635' }}
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No members available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
