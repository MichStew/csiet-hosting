import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  ArrowLeft, 
  User, 
  Users, 
  Briefcase, 
  Save, 
  Loader2, 
  Search, 
  FileText,
  Mail,
  Phone,
  Building2,
  Calendar
} from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();
const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const UNAUTHORIZED_STATUSES = new Set([401, 403]);

export default function Dashboard({ onNavigate, auth, onProfileUpdate, onSessionExpired }) {
  const token = auth?.token;
  const user = auth?.user;
  const userRole = user?.role || 'member';

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    major: user?.major || '',
    year: user?.year || '',
    interestsText: user?.interests ? user.interests.join(', ') : '',
    resumeUrl: user?.resumeUrl || '',
    phone: user?.phone || '',
    employeeName: user?.employeeName || '',
  });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Members state
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Job postings state
  const [jobPostings, setJobPostings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const defaultSessionMessage = 'Your session expired. Please log in again.';

  const handleExpiredSession = (message) => {
    const readableMessage = message || defaultSessionMessage;
    setErrorMessage(readableMessage);
    onSessionExpired?.(readableMessage);
  };

  // Load user profile and members
  useEffect(() => {
    if (!token) {
      return;
    }
    let isMounted = true;

    const loadData = async () => {
      setLoadingMembers(true);
      setErrorMessage('');

      try {
        const [membersRes, meRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/members/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const membersUnauthorized = UNAUTHORIZED_STATUSES.has(membersRes.status);
        const meUnauthorized = UNAUTHORIZED_STATUSES.has(meRes.status);

        if (membersUnauthorized || meUnauthorized) {
          const unauthorizedBody = membersUnauthorized
            ? await membersRes.json().catch(() => ({}))
            : await meRes.json().catch(() => ({}));
          handleExpiredSession(unauthorizedBody?.message);
          return;
        }

        if (!membersRes.ok) {
          const body = await membersRes.json().catch(() => ({}));
          throw new Error(body?.message || 'Unable to load members.');
        }
        if (!meRes.ok) {
          const body = await meRes.json().catch(() => ({}));
          throw new Error(body?.message || 'Unable to load your profile.');
        }

        const membersData = await membersRes.json();
        const meData = await meRes.json();

        if (!isMounted) return;

        const sortedMembers = (membersData.members || []).map((member) => ({
          ...member,
          interests: member.interests || [],
        }));
        setMembers(sortedMembers);
        setSelectedMemberEmail(meData.member?.email || sortedMembers[0]?.email || '');
        setProfileForm({
          name: meData.member?.name || '',
          major: meData.member?.major || '',
          year: meData.member?.year || '',
          resumeUrl: meData.member?.resumeUrl || '',
          interestsText: (meData.member?.interests || []).join(', '),
          phone: meData.member?.phone || '',
          employeeName: meData.member?.employeeName || '',
        });
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Unexpected error while loading data.');
        }
      } finally {
        if (isMounted) {
          setLoadingMembers(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Load job postings (placeholder - will need backend implementation)
  useEffect(() => {
    if (!token) {
      return;
    }
    // TODO: Replace with actual API call when backend is ready
    // For now, using placeholder data
    setLoadingJobs(true);
    setTimeout(() => {
      setJobPostings([
        {
          id: '1',
          title: 'Software Engineering Intern',
          company: 'Tech Corp',
          location: 'Remote',
          description: 'Looking for a software engineering intern with experience in React and Node.js.',
          postedDate: new Date().toISOString(),
          type: 'Internship',
        },
        {
          id: '2',
          title: 'Mechanical Engineer',
          company: 'Engineering Solutions',
          location: 'Auburn, AL',
          description: 'Full-time position for a mechanical engineer with 2+ years of experience.',
          postedDate: new Date(Date.now() - 86400000).toISOString(),
          type: 'Full-time',
        },
      ]);
      setLoadingJobs(false);
    }, 500);
  }, [token]);

  // Handle dropdown outside click
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

  // Filter members
  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      if (!query) return true;
      return (
        member.name.toLowerCase().includes(query) ||
        member.major?.toLowerCase().includes(query) ||
        member.year?.toLowerCase().includes(query) ||
        member.interests.some((interest) => interest.toLowerCase().includes(query)) ||
        member.email.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, members]);

  // Filter job postings
  const filteredJobs = useMemo(() => {
    const query = jobSearchQuery.toLowerCase();
    return jobPostings.filter((job) => {
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.type.toLowerCase().includes(query)
      );
    });
  }, [jobSearchQuery, jobPostings]);

  const activeMember =
    members.find((member) => member.email === selectedMemberEmail) ||
    filteredMembers[0] ||
    null;

  const handleSelectMember = (memberEmail) => {
    const member = members.find((m) => m.email === memberEmail);
    if (!member) return;
    setSelectedMemberEmail(member.email);
    setSearchQuery(member.name);
    setIsDropdownOpen(false);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileStatus({ type: '', message: '' });

    const interestsArray = profileForm.interestsText
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          major: profileForm.major,
          year: profileForm.year,
          interests: interestsArray,
          resumeUrl: profileForm.resumeUrl,
          phone: profileForm.phone,
          employeeName: profileForm.employeeName,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (UNAUTHORIZED_STATUSES.has(response.status)) {
        handleExpiredSession(data?.message);
        setProfileStatus({
          type: 'error',
          message: data?.message || defaultSessionMessage,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save profile.');
      }

      setMembers((prev) => {
        const exists = prev.some((member) => member.email === data.member.email);
        const updatedMember = { ...data.member, interests: data.member.interests || [] };
        if (!exists) {
          return [...prev, updatedMember];
        }
        return prev.map((member) =>
          member.email === updatedMember.email ? updatedMember : member
        );
      });
      setSelectedMemberEmail(data.member.email);
      onProfileUpdate?.(data.member);

      setProfileStatus({
        type: 'success',
        message: 'Profile updated successfully.',
      });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err.message || 'Unable to save profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#ebe3d5' }}>
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-2xl font-semibold" style={{ color: '#733635' }}>
            Please sign in to access the dashboard
          </h2>
          <p className="text-gray-600">
            Your session expired or you navigated here directly. Log in again to securely access your dashboard.
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'company':
        return 'Employer';
      case 'member':
        return 'Member';
      default:
        return 'User';
    }
  };

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
          <h1 className="text-white text-center mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-white/80 text-center">
            Welcome back, {user?.name || 'User'} • {getRoleDisplayName(userRole)}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {errorMessage && (
          <div className="mb-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            {errorMessage}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto mb-8 grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Postings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }} className="text-2xl">
                  Your Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {userRole === 'company' && (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-sm font-medium" htmlFor="employeeName">
                        Company/Organization Name
                      </label>
                      <Input
                        id="employeeName"
                        name="employeeName"
                        value={profileForm.employeeName}
                        onChange={handleProfileChange}
                        placeholder="Enter company name"
                      />
                    </div>
                  )}

                  {userRole === 'member' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="major">
                          Major
                        </label>
                        <Input
                          id="major"
                          name="major"
                          value={profileForm.major}
                          onChange={handleProfileChange}
                          placeholder="Mechanical Engineering"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="year">
                          Year
                        </label>
                        <select
                          id="year"
                          name="year"
                          value={profileForm.year}
                          onChange={handleProfileChange}
                          className="w-full rounded-md border px-3 py-2"
                        >
                          <option value="">Select year</option>
                          {YEAR_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-medium" htmlFor="phone">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {userRole === 'member' && (
                    <>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-medium" htmlFor="interests">
                          Interests (comma separated)
                        </label>
                        <Textarea
                          id="interests"
                          name="interestsText"
                          value={profileForm.interestsText}
                          onChange={handleProfileChange}
                          placeholder="Product Design, Client Relations, Leadership"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-medium" htmlFor="resumeUrl">
                          Resume URL
                        </label>
                        <Input
                          id="resumeUrl"
                          name="resumeUrl"
                          value={profileForm.resumeUrl}
                          onChange={handleProfileChange}
                          placeholder="https://example.com/resume.pdf"
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                    {profileStatus.message && (
                      <p
                        className={`text-sm ${
                          profileStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {profileStatus.message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="self-start text-white"
                      style={{ backgroundColor: '#733635' }}
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Display current profile info */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#733635' }}>
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <Badge style={{ backgroundColor: '#733635', color: 'white' }}>
                        {getRoleDisplayName(userRole)}
                      </Badge>
                    </div>
                    {user?.major && (
                      <div>
                        <p className="text-sm text-gray-500">Major</p>
                        <p className="font-medium">{user.major}</p>
                      </div>
                    )}
                    {user?.year && (
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">{user.year}</p>
                      </div>
                    )}
                    {user?.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    )}
                    {user?.employeeName && (
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{user.employeeName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="max-w-6xl mx-auto">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }} className="text-2xl">
                  Member Database
                </CardTitle>
                <CardDescription>
                  {userRole === 'admin' || userRole === 'company'
                    ? 'Browse and search all members'
                    : 'View member profiles'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search members by name, major, year, interests, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Member Selector */}
                {filteredMembers.length > 0 && (
                  <div ref={dropdownRef} className="mb-6">
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left font-normal bg-white"
                        style={{ borderColor: '#733635', color: '#733635' }}
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        disabled={loadingMembers}
                      >
                        <span>
                          {loadingMembers
                            ? 'Loading members...'
                            : activeMember
                              ? activeMember.name
                              : 'Select a member'}
                        </span>
                      </Button>
                      {isDropdownOpen && (
                        <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                          {filteredMembers.map((member) => (
                            <button
                              key={member.email}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col"
                              onClick={() => handleSelectMember(member.email)}
                            >
                              <span className="font-medium" style={{ color: '#733635' }}>
                                {member.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {member.major || 'Major TBD'} • {member.year || 'Year TBD'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Members Table */}
                {loadingMembers ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#733635' }} />
                    <p className="text-gray-600">Loading members...</p>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Showing {filteredMembers.length} of {members.length} members
                      </p>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Major</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Interests</TableHead>
                            {userRole === 'admin' && <TableHead>Role</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => (
                            <TableRow
                              key={member.email}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                setSelectedMemberEmail(member.email);
                                setSearchQuery(member.name);
                              }}
                            >
                              <TableCell className="font-medium">{member.name}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{member.major || '—'}</TableCell>
                              <TableCell>{member.year || '—'}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {member.interests?.slice(0, 3).map((interest) => (
                                    <Badge
                                      key={interest}
                                      variant="outline"
                                      className="text-xs"
                                      style={{ borderColor: '#733635', color: '#733635' }}
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                  {member.interests?.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{member.interests.length - 3}
                                    </Badge>
                                  )}
                                  {(!member.interests || member.interests.length === 0) && (
                                    <span className="text-gray-400 text-xs">—</span>
                                  )}
                                </div>
                              </TableCell>
                              {userRole === 'admin' && (
                                <TableCell>
                                  <Badge variant="outline">{member.role || 'member'}</Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Member Details Card */}
                    {activeMember && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle style={{ color: '#733635' }} className="text-xl">
                            {activeMember.name}
                          </CardTitle>
                          <CardDescription>{activeMember.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeMember.major && (
                              <div>
                                <p className="text-sm text-gray-500">Major</p>
                                <p className="font-medium">{activeMember.major}</p>
                              </div>
                            )}
                            {activeMember.year && (
                              <div>
                                <p className="text-sm text-gray-500">Year</p>
                                <p className="font-medium">{activeMember.year}</p>
                              </div>
                            )}
                            {activeMember.phone && (
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{activeMember.phone}</p>
                              </div>
                            )}
                            {activeMember.interests?.length > 0 && (
                              <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-gray-500 mb-2">Interests</p>
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
                            )}
                            {activeMember.resumeUrl && (
                              <div className="col-span-1 md:col-span-2">
                                <a
                                  href={activeMember.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm hover:underline"
                                  style={{ color: '#733635' }}
                                >
                                  <FileText className="h-4 w-4" />
                                  View Resume
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No members found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="max-w-6xl mx-auto">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }} className="text-2xl">
                  Job Postings
                </CardTitle>
                <CardDescription>
                  {userRole === 'admin' || userRole === 'company'
                    ? 'Manage and view all job postings'
                    : 'Browse available job opportunities'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search jobs by title, company, location, or type..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {loadingJobs ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#733635' }} />
                    <p className="text-gray-600">Loading job postings...</p>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(job.postedDate).toLocaleDateString()}
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              variant="outline"
                              style={{ borderColor: '#733635', color: '#733635' }}
                            >
                              {job.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{job.description}</p>
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              style={{ borderColor: '#733635', color: '#733635' }}
                            >
                              View Details
                            </Button>
                            {userRole === 'member' && (
                              <Button style={{ backgroundColor: '#733635', color: 'white' }}>
                                Apply Now
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg mb-2">No job postings found</p>
                    <p className="text-gray-500 text-sm">
                      {jobSearchQuery
                        ? 'Try adjusting your search terms'
                        : 'Check back later for new opportunities'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

