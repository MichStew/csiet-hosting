import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, ChevronsUpDown, FileText, Loader2, Save, Search } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export default function MemberInfo({ onNavigate, auth, onProfileUpdate }) {
  const token = auth?.token;
  const user = auth?.user;

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    major: '',
    year: '',
    interestsText: '',
    resumeUrl: '',
  });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let isMounted = true;

    const loadMembers = async () => {
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
        setSelectedMemberEmail((prev) => prev || meData.member?.email || sortedMembers[0]?.email || '');
        setProfileForm({
          name: meData.member?.name || '',
          major: meData.member?.major || '',
          year: meData.member?.year || '',
          resumeUrl: meData.member?.resumeUrl || '',
          interestsText: (meData.member?.interests || []).join(', '),
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

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [token]);

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
  }, [searchQuery, members]);

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
        }),
      });

      const data = await response.json().catch(() => ({}));

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
          <p className="text-white/80 text-center">
            Welcome back, {user?.name || 'member'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#733635' }}>
                Update Your Profile
              </CardTitle>
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
                  <div className="relative">
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
                </div>
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
            </CardContent>
          </Card>
        </div>

        <div ref={dropdownRef} className="max-w-2xl mx-auto">
          <p className="mb-2 text-center text-gray-600">
            Select a member to view their details
          </p>
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal bg-white"
              style={{ borderColor: '#733635', color: '#733635' }}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              disabled={loadingMembers || members.length === 0}
            >
              <span>
                {loadingMembers
                  ? 'Loading members...'
                  : activeMember
                    ? activeMember.name
                    : 'No members available'}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
            {isDropdownOpen && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg overflow-hidden z-10">
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
                        onClick={() => handleSelectMember(member.email)}
                      >
                        <span className="font-medium" style={{ color: '#733635' }}>
                          {member.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {member.major || 'Major TBD'} • {member.year || 'Year TBD'}
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

        {errorMessage && (
          <div className="text-center text-red-600">
            {errorMessage}
          </div>
        )}

        {activeMember ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: '#733635' }} className="text-3xl">
                  {activeMember.name}
                </CardTitle>
                <p className="text-gray-600">{activeMember.email}</p>
                {activeMember.year && (
                  <Badge
                    variant="outline"
                    className="w-fit mt-2"
                    style={{ borderColor: '#733635', color: '#733635' }}
                  >
                    {activeMember.year}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activeMember.major && (
                    <div>
                      <p className="text-sm uppercase tracking-wide text-gray-500">
                        Major
                      </p>
                      <p className="text-lg">{activeMember.major}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeMember.interests?.length ? (
                        activeMember.interests.map((interest) => (
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
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No interests listed.</span>
                      )}
                    </div>
                  </div>
                  {activeMember.resumeUrl && (
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
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            {loadingMembers ? (
              <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading member details...
              </p>
            ) : (
              <p className="text-gray-600 text-lg">No members available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
