import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
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
  Calendar,
  ChevronsUpDown,
  MapPin,
  Clock,
  ChevronDown
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobFilterType, setJobFilterType] = useState('');
  const [isJobFilterDropdownOpen, setIsJobFilterDropdownOpen] = useState(false);
  const jobFilterDropdownRef = useRef(null);

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

  // Handle job filter dropdown outside click
  useEffect(() => {
    if (!isJobFilterDropdownOpen) {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (jobFilterDropdownRef.current && !jobFilterDropdownRef.current.contains(event.target)) {
        setIsJobFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isJobFilterDropdownOpen]);

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

  // Get unique filter suggestions
  const jobFilterSuggestions = useMemo(() => {
    const types = [...new Set(jobPostings.map(job => job.type).filter(Boolean))];
    const companies = [...new Set(jobPostings.map(job => job.company).filter(Boolean))];
    const locations = [...new Set(jobPostings.map(job => job.location).filter(Boolean))];
    return { types, companies, locations };
  }, [jobPostings]);

  // Filter job postings
  const filteredJobs = useMemo(() => {
    let filtered = jobPostings;
    
    // Apply filter dropdown selection
    if (jobFilterType) {
      filtered = filtered.filter((job) => {
        return (
          job.type === jobFilterType ||
          job.company === jobFilterType ||
          job.location === jobFilterType
        );
      });
    }
    
    // Apply search query
    const query = jobSearchQuery.toLowerCase();
    if (query) {
      filtered = filtered.filter((job) => {
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.type.toLowerCase().includes(query)
        );
      });
    }
    
    return filtered;
  }, [jobSearchQuery, jobPostings, jobFilterType]);

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setIsJobDialogOpen(true);
  };

  const handleSelectJobFilter = (filterValue) => {
    setJobFilterType(filterValue === jobFilterType ? '' : filterValue);
    setIsJobFilterDropdownOpen(false);
  };

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
      {/* Enhanced Header with Gradient */}
      <div className="relative py-12 px-4 overflow-hidden" style={{ backgroundColor: '#733635' }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="text-white hover:bg-white/20 mb-6 transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-white mb-3 text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
              Dashboard
            </h1>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <p className="text-white/90 text-lg font-medium">
                Welcome back, <span className="font-bold">{user?.name || 'User'}</span>
              </p>
              <span className="text-white/60">•</span>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                {getRoleDisplayName(userRole)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {errorMessage && (
          <div className="mb-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            {errorMessage}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto mb-10 grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-white/50 rounded-xl p-1.5">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#733635] data-[state=active]:to-[#8b4a4a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-semibold"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#733635] data-[state=active]:to-[#8b4a4a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-semibold"
            >
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#733635] data-[state=active]:to-[#8b4a4a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-semibold"
            >
              <Briefcase className="h-4 w-4" />
              Job Postings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-white/50 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">
                      Your Profile
                    </CardTitle>
                    <CardDescription className="text-white/90 mt-1">
                      Update your personal information and preferences
                    </CardDescription>
                  </div>
                </div>
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
                      className="self-start text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-[#733635] to-[#8b4a4a] hover:from-[#8b4a4a] hover:to-[#733635]"
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
                <div className="mt-8 pt-8 border-t-2 border-amber-200/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-1 w-12 bg-gradient-to-r from-[#733635] to-[#8b4a4a] rounded-full"></div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-[#733635] to-[#8b4a4a] bg-clip-text text-transparent">
                      Profile Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Email</p>
                      <p className="font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Role</p>
                      <Badge className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white border-0 shadow-md">
                        {getRoleDisplayName(userRole)}
                      </Badge>
                    </div>
                    {user?.major && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Major</p>
                        <p className="font-semibold text-gray-900">{user.major}</p>
                      </div>
                    )}
                    {user?.year && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Year</p>
                        <Badge variant="outline" className="border-[#733635] text-[#733635] font-semibold">
                          {user.year}
                        </Badge>
                      </div>
                    )}
                    {user?.phone && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Phone</p>
                        <p className="font-semibold text-gray-900">{user.phone}</p>
                      </div>
                    )}
                    {user?.employeeName && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Company</p>
                        <p className="font-semibold text-gray-900">{user.employeeName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="max-w-6xl mx-auto shadow-2xl border-2 border-white/50 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">
                      Member Database
                    </CardTitle>
                    <CardDescription className="text-white/90 mt-1">
                      {userRole === 'admin' || userRole === 'company'
                        ? 'Browse and search all members'
                        : 'View member profiles'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#733635] group-focus-within:text-[#8b4a4a] transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search members by name, major, year, interests, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 border-2 border-amber-200 focus:border-[#733635] rounded-xl shadow-sm focus:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Member Selector */}
                {filteredMembers.length > 0 && (
                  <div ref={dropdownRef} className="mb-6">
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left font-semibold bg-gradient-to-r from-white to-amber-50/50 border-2 border-[#733635] text-[#733635] hover:bg-gradient-to-r hover:from-[#733635] hover:to-[#8b4a4a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
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
                        <ChevronsUpDown className="h-4 w-4 opacity-70" />
                      </Button>
                      {isDropdownOpen && (
                        <div className="absolute mt-2 w-full bg-white/95 backdrop-blur-md border-2 border-amber-200/50 rounded-xl shadow-2xl overflow-hidden z-10 max-h-64 overflow-y-auto">
                          {filteredMembers.map((member) => (
                            <button
                              key={member.email}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-rose-50/30 transition-all duration-200 flex flex-col border-b border-amber-100/50 last:border-0"
                              onClick={() => handleSelectMember(member.email)}
                            >
                              <span className="font-bold text-lg" style={{ color: '#733635' }}>
                                {member.name}
                              </span>
                              <span className="text-sm text-gray-600 mt-0.5">
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
                    <div className="border-2 border-amber-200/50 rounded-xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-[#733635] to-[#8b4a4a]">
                          <TableRow className="border-amber-200/30 hover:bg-transparent">
                            <TableHead className="text-white font-bold">Name</TableHead>
                            <TableHead className="text-white font-bold">Email</TableHead>
                            <TableHead className="text-white font-bold">Major</TableHead>
                            <TableHead className="text-white font-bold">Year</TableHead>
                            <TableHead className="text-white font-bold">Interests</TableHead>
                            {userRole === 'admin' && <TableHead className="text-white font-bold">Role</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member, index) => (
                            <TableRow
                              key={member.email}
                              className="cursor-pointer hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-rose-50/30 transition-all duration-200 border-b border-amber-100/50"
                              onClick={() => {
                                setSelectedMemberEmail(member.email);
                                setSearchQuery(member.name);
                              }}
                            >
                              <TableCell className="font-bold text-gray-900">{member.name}</TableCell>
                              <TableCell className="text-gray-700">{member.email}</TableCell>
                              <TableCell>
                                {member.major ? (
                                  <Badge variant="outline" className="border-[#733635] text-[#733635] font-semibold">
                                    {member.major}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {member.year ? (
                                  <Badge className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white border-0 font-semibold">
                                    {member.year}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1.5">
                                  {member.interests?.slice(0, 3).map((interest) => (
                                    <Badge
                                      key={interest}
                                      className="text-xs px-2 py-0.5 shadow-sm"
                                      style={{
                                        background: 'linear-gradient(135deg, rgba(115, 54, 53, 0.15) 0%, rgba(139, 74, 74, 0.15) 100%)',
                                        color: '#733635',
                                        border: '1px solid rgba(115, 54, 53, 0.2)',
                                      }}
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                  {member.interests?.length > 3 && (
                                    <Badge variant="outline" className="text-xs border-[#733635] text-[#733635]">
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
                                  <Badge variant="outline" className="border-[#733635] text-[#733635] font-semibold">
                                    {member.role || 'member'}
                                  </Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Member Details Card */}
                    {activeMember && (
                      <Card className="mt-6 shadow-xl border-2 border-white/50 bg-gradient-to-br from-white via-amber-50/30 to-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardHeader className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white rounded-t-lg">
                          <CardTitle className="text-2xl font-bold">
                            {activeMember.name}
                          </CardTitle>
                          <CardDescription className="text-white/90">{activeMember.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeMember.major && (
                              <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Major</p>
                                <p className="font-semibold text-gray-900 text-lg">{activeMember.major}</p>
                              </div>
                            )}
                            {activeMember.year && (
                              <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Year</p>
                                <Badge className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white border-0 shadow-md text-sm px-3 py-1">
                                  {activeMember.year}
                                </Badge>
                              </div>
                            )}
                            {activeMember.phone && (
                              <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  Phone
                                </p>
                                <p className="font-semibold text-gray-900">{activeMember.phone}</p>
                              </div>
                            )}
                            {activeMember.interests?.length > 0 && (
                              <div className="col-span-1 md:col-span-2 p-4 rounded-lg bg-gradient-to-br from-white to-amber-50/50 border border-amber-100 shadow-sm">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Interests</p>
                                <div className="flex flex-wrap gap-2">
                                  {activeMember.interests.map((interest) => (
                                    <Badge
                                      key={interest}
                                      className="text-xs px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                                      style={{
                                        background: 'linear-gradient(135deg, rgba(115, 54, 53, 0.15) 0%, rgba(139, 74, 74, 0.15) 100%)',
                                        color: '#733635',
                                        border: '1px solid rgba(115, 54, 53, 0.2)',
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
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          <TabsContent value="jobs" className="space-y-6 animate-in fade-in-50 duration-500">
            <Card className="max-w-6xl mx-auto shadow-2xl border-2 border-white/50 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="bg-gradient-to-r from-[#733635] to-[#8b4a4a] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">
                      Job Postings
                    </CardTitle>
                    <CardDescription className="text-white/90 mt-1">
                      {userRole === 'admin' || userRole === 'company'
                        ? 'Manage and view all job postings'
                        : 'Browse available job opportunities'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#733635] group-focus-within:text-[#8b4a4a] transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search jobs by title, company, location, or type..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 border-2 border-amber-200 focus:border-[#733635] rounded-xl shadow-sm focus:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Filter Dropdown with Suggestions */}
                  <div ref={jobFilterDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal bg-white"
                      style={{ borderColor: '#733635', color: '#733635' }}
                      onClick={() => setIsJobFilterDropdownOpen((prev) => !prev)}
                    >
                      <span>
                        {jobFilterType ? `Filter: ${jobFilterType}` : 'Filter by Type, Company, or Location'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isJobFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    {isJobFilterDropdownOpen && (
                      <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Filter Suggestions</p>
                        </div>
                        {jobFilterSuggestions.types.length > 0 && (
                          <>
                            <div className="px-2 py-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase">Job Type</p>
                            </div>
                            {jobFilterSuggestions.types.map((type) => (
                              <button
                                key={`type-${type}`}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                                  jobFilterType === type ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => handleSelectJobFilter(type)}
                              >
                                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{type}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {jobFilterSuggestions.companies.length > 0 && (
                          <>
                            <div className="px-2 py-1 mt-2">
                              <p className="text-xs font-semibold text-gray-400 uppercase">Company</p>
                            </div>
                            {jobFilterSuggestions.companies.map((company) => (
                              <button
                                key={`company-${company}`}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                                  jobFilterType === company ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => handleSelectJobFilter(company)}
                              >
                                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{company}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {jobFilterSuggestions.locations.length > 0 && (
                          <>
                            <div className="px-2 py-1 mt-2">
                              <p className="text-xs font-semibold text-gray-400 uppercase">Location</p>
                            </div>
                            {jobFilterSuggestions.locations.map((location) => (
                              <button
                                key={`location-${location}`}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                                  jobFilterType === location ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => handleSelectJobFilter(location)}
                              >
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{location}</span>
                              </button>
                            ))}
                          </>
                        )}
                        {jobFilterType && (
                          <div className="border-t mt-2">
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                              onClick={() => handleSelectJobFilter('')}
                            >
                              Clear Filter
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {loadingJobs ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#733635' }} />
                    <p className="text-gray-600">Loading job postings...</p>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Showing {filteredJobs.length} of {jobPostings.length} job postings
                        {jobFilterType && ` • Filtered by: ${jobFilterType}`}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {filteredJobs.map((job) => (
                        <Card 
                          key={job.id} 
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleViewJobDetails(job)}
                        >
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
                                    <MapPin className="h-4 w-4" />
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
                            <p className="text-gray-700" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>{job.description}</p>
                            <div className="mt-4 flex gap-2">
                              <Button
                                variant="outline"
                                style={{ borderColor: '#733635', color: '#733635' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewJobDetails(job);
                                }}
                              >
                                View Details
                              </Button>
                              {userRole === 'member' && (
                                <Button 
                                  style={{ backgroundColor: '#733635', color: 'white' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewJobDetails(job);
                                  }}
                                >
                                  Apply Now
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
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

      {/* Job Details Dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{ color: '#733635' }}>
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {selectedJob.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedJob.postedDate).toLocaleDateString()}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{ borderColor: '#733635', color: '#733635' }}
                  >
                    {selectedJob.type}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#733635' }}>
                    Job Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
                
                {selectedJob.requirements && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#733635' }}>
                      Requirements
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}
                
                {selectedJob.salary && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#733635' }}>
                      Salary
                    </h3>
                    <p className="text-gray-700">{selectedJob.salary}</p>
                  </div>
                )}
                
                {selectedJob.contactEmail && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#733635' }}>
                      Contact Information
                    </h3>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`mailto:${selectedJob.contactEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedJob.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedJob.contactPhone && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`tel:${selectedJob.contactPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedJob.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {userRole === 'member' && (
                  <Button 
                    style={{ backgroundColor: '#733635', color: 'white' }}
                    onClick={() => {
                      if (selectedJob.contactEmail) {
                        window.location.href = `mailto:${selectedJob.contactEmail}?subject=Application for ${selectedJob.title}`;
                      }
                    }}
                  >
                    Apply Now
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setIsJobDialogOpen(false)}
                  style={{ borderColor: '#733635', color: '#733635' }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

