import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, ArrowLeft, FileText, Loader2, Save, Search } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();
const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const UNAUTHORIZED_STATUSES = new Set([401, 403]);

const isProfileComplete = (member) => {
  if (!member) return false;
  const hasMajor = Boolean(member.major?.trim());
  const hasYear = Boolean(member.year?.trim());
  const hasInterests = Array.isArray(member.interests) && member.interests.some((i) => i?.trim());
  const hasResume = Boolean(member.resumeUrl?.trim());
  return hasMajor && hasYear && hasInterests && hasResume;
};

export default function MemberInfo({ onNavigate, auth, onProfileUpdate, onSessionExpired }) {
  const token = auth?.token;
  const user = auth?.user;

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    major: '',
    year: '',
    interestsText: '',
    resumeUrl: '',
    profileImageUrl: user?.profileImageUrl || '',
  });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mustCompleteProfile, setMustCompleteProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const defaultSessionMessage = 'Your session expired. Please log in again.';

  const handleExpiredSession = (message) => {
    const readableMessage = message || defaultSessionMessage;
    setErrorMessage(readableMessage);
    onSessionExpired?.(readableMessage);
  };

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
        const profileComplete = isProfileComplete(meData.member);
        setMustCompleteProfile(!profileComplete);
        setSelectedMemberEmail((prev) => prev || meData.member?.email || sortedMembers[0]?.email || '');
        setProfileForm({
          name: meData.member?.name || '',
          major: meData.member?.major || '',
          year: meData.member?.year || '',
          resumeUrl: meData.member?.resumeUrl || '',
          profileImageUrl: meData.member?.profileImageUrl || '',
          interestsText: (meData.member?.interests || []).join(', '),
        });
        setProfileChecked(true);
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Unexpected error while loading data.');
        }
      } finally {
        if (isMounted) {
          setLoadingMembers(false);
          setProfileChecked(true);
        }
      }
    };

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const name = member.name || '';
      const major = member.major || '';
      const year = member.year || '';
      const interests = Array.isArray(member.interests) ? member.interests : [];
      if (!query) return true;
      return (
        name.toLowerCase().includes(query) ||
        major.toLowerCase().includes(query) ||
        year.toLowerCase().includes(query) ||
        interests.some((interest) => interest.toLowerCase().includes(query))
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
          profileImageUrl: profileForm.profileImageUrl,
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
      setMustCompleteProfile(!isProfileComplete(data.member));

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

  const profileFormCard = (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#733635' }}>
          {mustCompleteProfile ? 'Complete Your Profile' : 'Update Your Profile'}
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
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="profileImageUrl">
              Profile Image URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                id="profileImageUrl"
                name="profileImageUrl"
                value={profileForm.profileImageUrl}
                onChange={handleProfileChange}
                placeholder="https://example.com/photo.jpg"
              />
              {profileForm.profileImageUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50 self-start">
                  <img
                    src={profileForm.profileImageUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Paste a direct link to your headshot (JPG or PNG). Square images look best.
            </p>
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
  );

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
        {mustCompleteProfile && profileChecked && (
          <Card className="max-w-4xl mx-auto border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-800">Finish your profile to unlock the directory</p>
                <p className="text-sm text-amber-800/80">
                  Add your major, year, interests, and resume link so members with similar backgrounds can discover you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="max-w-4xl mx-auto">
          {profileFormCard}
        </div>

        {!mustCompleteProfile && (
          <>
            <div className="max-w-5xl mx-auto w-full">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle style={{ color: '#733635' }}>Member Database</CardTitle>
                  <p className="text-sm text-gray-600">Search by name, major, year, or interests to find similar members.</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search members (e.g., Computer Science, leadership, senior)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Showing {filteredMembers.length} of {members.length} members
                  </p>
                  <div className="mt-4 max-h-[520px] overflow-y-auto pr-1 space-y-2">
                    {loadingMembers ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm px-2 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading members...
                      </div>
                    ) : filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => {
                        const interests = Array.isArray(member.interests) ? member.interests : [];
                        const isSelected = member.email === selectedMemberEmail;
                        return (
                          <button
                            key={member.email}
                            className={`w-full text-left rounded-lg border px-4 py-3 transition hover:shadow-sm ${
                              isSelected ? 'border-[#733635] bg-rose-50/70' : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => handleSelectMember(member.email)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div>
                                <p className="font-semibold" style={{ color: '#733635' }}>
                                  {member.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {member.major || 'Major TBD'}
                                </p>
                                <p className="text-xs text-gray-500 break-all">{member.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="w-fit"
                                  style={{ borderColor: '#733635', color: '#733635' }}
                                >
                                  {member.year || 'Year TBD'}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {interests.length ? (
                                interests.map((interest) => (
                                  <Badge
                                    key={interest}
                                    className="text-xs"
                                    style={{
                                      backgroundColor: 'rgba(115, 54, 53, 0.08)',
                                      color: '#733635',
                                      border: 'none',
                                    }}
                                  >
                                    {interest}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">No interests listed yet.</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 px-2 py-3">
                        No members match “{searchQuery}”.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {errorMessage && (
              <div className="text-center text-red-600">
                {errorMessage}
              </div>
            )}

            {activeMember ? (
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div
                        className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 relative"
                        aria-hidden="true"
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-gray-500">
                          {(activeMember.name || '?').charAt(0).toUpperCase()}
                        </div>
                        {activeMember.profileImageUrl ? (
                          <img
                            src={activeMember.profileImageUrl}
                            alt={`${activeMember.name || 'Member'} avatar`}
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        <CardTitle style={{ color: '#733635' }} className="text-3xl">
                          {activeMember.name}
                        </CardTitle>
                        <p className="text-gray-600 break-all">{activeMember.email}</p>
                        {activeMember.year && (
                          <Badge
                            variant="outline"
                            className="w-fit mt-2"
                            style={{ borderColor: '#733635', color: '#733635' }}
                          >
                            {activeMember.year}
                          </Badge>
                        )}
                      </div>
                    </div>
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
          </>
        )}
      </div>
    </div>
  );
}
