import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import PageShell from '@/components/layout/PageShell'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { verifyEmail } from '@/lib/api'

export default function VerifyEmail() {
  const reduced = useReducedMotion()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    verifyEmail(token)
      .then((res) => {
        if (res.success) {
          setSuccess(true)
        } else {
          setError(res.message || 'Verification failed. The link may have expired.')
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Verification failed. The link may have expired.')
      })
      .finally(() => setLoading(false))
  }, [token])

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-16">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/[0.05]">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Email verification</h1>
              <p className="text-sm text-neutral-400 mt-2">
                {token ? 'Verifying your email address...' : 'No verification token provided.'}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {!token ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                  <p className="text-sm text-neutral-400 mb-6">
                    The verification link is missing a token. Please check the link in your email.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              ) : loading ? (
                <div className="text-center py-6">
                  <Loader2 className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-spin" />
                  <p className="text-sm text-neutral-400">Verifying your email...</p>
                </div>
              ) : success ? (
                <motion.div
                  initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-white mb-2">Email verified successfully</h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    Your email has been verified. You can now sign in to your account.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to login
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-white mb-2">Verification failed</h2>
                  <p className="text-sm text-neutral-400 mb-6">{error}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
