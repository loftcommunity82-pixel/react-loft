import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Briefcase, Users, Plus, Loader2, ArrowRight, ExternalLink } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useCompanyJobs, useCompanyProfile } from '@/lib/api-hooks'

const appStatusColors: Record<string, string> = {
  PENDING: 'text-yellow-400',
  REVIEWING: 'text-blue-400',
  SHORTLISTED: 'text-purple-400',
  INTERVIEW: 'text-indigo-400',
  OFFERED: 'text-emerald-400',
  HIRED: 'text-green-400',
  REJECTED: 'text-red-400',
}

export default function EmployerDashboardPage() {
  const { user } = useAuth()
  const [superApps, setSuperApps] = useState<any>(null)
  const [isSuper, setIsSuper] = useState(false)

  const { jobs, loading: jobsLoading } = useCompanyJobs(user?.email)
  const { profile: company, loading: profileLoading } = useCompanyProfile(user?.email)

  useEffect(() => {
    fetch('/api/admin/applications?limit=10', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) { setSuperApps(data); setIsSuper(true) }
      })
      .catch(() => {})
  }, [])

  const loading = jobsLoading || profileLoading
  const totalApplicants = jobs.reduce((acc: number, j: any) => acc + (j.applicationsCount || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Employer Dashboard</h1>
          <Link to="/jobs/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Post Job
            </Button>
          </Link>
        </div>

        {isSuper && superApps && (
          <Card className="bg-card border mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">All Applications (Platform-wide)</h2>
                <Link to="/admin/applications">
                  <Button variant="outline" size="sm">
                    View All <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {[
                  { label: 'Pending', key: 'pendingCount', color: 'text-yellow-400' },
                  { label: 'Reviewing', key: 'reviewingCount', color: 'text-blue-400' },
                  { label: 'Shortlisted', key: 'shortlistedCount', color: 'text-purple-400' },
                  { label: 'Interview', key: 'interviewCount', color: 'text-indigo-400' },
                  { label: 'Offered', key: 'offeredCount', color: 'text-emerald-400' },
                  { label: 'Rejected', key: 'rejectedCount', color: 'text-red-400' },
                ].map(s => (
                  <div key={s.key} className="text-center p-2 rounded-lg bg-muted/20">
                    <p className={`text-lg font-bold ${s.color}`}>{superApps.stats?.[s.key] ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {superApps.applications?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Candidate</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Job</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Status</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {superApps.applications.slice(0, 5).map((app: any) => (
                        <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 text-foreground text-xs">{app.candidate?.firstName || app.candidate?.email}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{app.job?.title}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs font-medium ${(appStatusColors as Record<string, string>)[app.status] || 'text-muted-foreground'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">
                            {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!company && (
          <Card className="bg-card border mb-8">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <img
                  src="/images/Company%20Avatar%20Placeholder.png"
                  alt="Company placeholder"
                  className="max-w-full max-h-full object-contain opacity-60"
                />
              </div>
              <p className="text-muted-foreground mb-4">Complete your company profile to post jobs</p>
              <Link to="/employer/company">
                <Button>Create Company Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                  <p className="text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalApplicants}</p>
                  <p className="text-muted-foreground">Total Applicants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-muted-foreground">Hired This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs">
          <TabsList className="bg-card">
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="candidates">All Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4">
            {jobs.length === 0 ? (
              <Card className="bg-card border">
                <CardContent className="p-6 text-center">
                  <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                    <img
                      src="/images/No%20Jobs.png"
                      alt="No jobs posted"
                      className="max-w-full max-h-full object-contain opacity-60"
                    />
                  </div>
                  <p className="text-muted-foreground">No jobs posted yet. Post your first job to start receiving applications.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job: any) => (
                  <Card key={job.id} className="bg-card border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-foreground font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground">{job.applicationsCount || 0} applicants</p>
                        </div>
                        <Badge variant={job.status === "PUBLISHED" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link to={`/employer/jobs/${job.id}/candidates`}>
                          <Button variant="outline" size="sm">View Candidates</Button>
                        </Link>
                        <Link to={`/jobs/${job.slug || job.id}`}>
                          <Button variant="ghost" size="sm">View Post</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates" className="mt-4">
            {jobs.length === 0 ? (
              <Card className="bg-card border">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No jobs posted yet. Create a job to start reviewing candidates.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    to={`/employer/jobs/${job.id}/candidates`}
                    className="block p-4 rounded-xl bg-card border hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-foreground font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.applicationsCount || 0} applicants</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
  )
}
