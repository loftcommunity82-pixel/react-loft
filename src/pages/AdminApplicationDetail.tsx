import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { useAdminApplication } from '@/lib/api-hooks'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  REVIEWING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHORTLISTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  INTERVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  OFFERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  HIRED: 'bg-green-500/10 text-green-400 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { application, loading, error } = useAdminApplication(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-4xl">
          <p className="text-destructive">{error || 'Application not found'}</p>
          <Button variant="outline" onClick={() => navigate('/admin/applications')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/admin/applications')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg font-medium text-emerald-400 shrink-0">
                    {application.candidate?.firstName?.[0] || application.candidate?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <CardTitle className="text-foreground">
                      {application.candidate?.firstName || application.candidate?.name || 'Unknown'}
                      {application.candidate?.lastName ? ` ${application.candidate.lastName}` : ''}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{application.candidate?.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.candidate?.profile?.jobTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Title</p>
                    <p className="text-sm text-foreground">{application.candidate.profile.jobTitle}</p>
                  </div>
                )}
                {application.candidate?.profile?.summary && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Summary</p>
                    <p className="text-sm text-foreground/80">{application.candidate.profile.summary}</p>
                  </div>
                )}
                {application.candidate?.profile?.experienceYears != null && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Experience</p>
                    <p className="text-sm text-foreground">{application.candidate.profile.experienceYears} years</p>
                  </div>
                )}
                {application.candidate?.profile?.skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.candidate.profile.skills.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-muted-foreground border">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {application.coverLetter && (
              <Card className="bg-card border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{application.coverLetter}</p>
                </CardContent>
              </Card>
            )}

            {application.employerNotes && (
              <Card className="bg-card border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Employer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{application.employerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Job Info & Status */}
          <div className="space-y-6">
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`font-medium ${statusColors[application.status] || ''}`}>
                    {application.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shortlisted</span>
                  <Badge variant={application.isShortlisted ? 'default' : 'outline'}>
                    {application.isShortlisted ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-sm text-foreground">
                    {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {application.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviewed</span>
                    <span className="text-sm text-foreground">
                      {new Date(application.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border">
              <CardContent className="p-4">
                <Link
                  to={`/messages?participantId=${application.candidate?.clerkId || ''}&participantName=${encodeURIComponent([application.candidate?.firstName, application.candidate?.lastName].filter(Boolean).join(' ').trim() || 'Candidate')}`}
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="w-4 h-4 mr-2" /> Message Candidate
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground font-medium">{application.job?.title}</p>
                {application.job?.company && (
                  <p className="text-sm text-muted-foreground">{application.job.company.companyName}</p>
                )}
                {application.job?.location && (
                  <p className="text-sm text-muted-foreground">{application.job.location}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {application.job?.jobType && (
                    <Badge variant="outline" className="text-xs">{application.job.jobType}</Badge>
                  )}
                  {application.job?.workMode && (
                    <Badge variant="outline" className="text-xs">{application.job.workMode}</Badge>
                  )}
                  {application.job?.experienceLevel && (
                    <Badge variant="outline" className="text-xs">{application.job.experienceLevel}</Badge>
                  )}
                </div>
                {application.job?.skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 mt-3">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.job.skills.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-muted-foreground">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {application.interview && (
              <Card className="bg-card border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground">
                    {new Date(application.interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                  {application.interview.type && (
                    <p className="text-sm text-muted-foreground">{application.interview.type}</p>
                  )}
                  {application.interview.meetingLink && (
                    <a href={application.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
                      Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
