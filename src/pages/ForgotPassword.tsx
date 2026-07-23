import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import PageShell from '@/components/layout/PageShell'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRequestPasswordReset } from '@/lib/api-hooks'
import { updatePassword } from '@/lib/api'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character (!@#$%^&*)'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ForgotForm = z.infer<typeof forgotSchema>
type ResetForm = z.infer<typeof resetSchema>

export default function ForgotPassword() {
  const reduced = useReducedMotion()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (token) {
    return <ResetPasswordForm token={token} reduced={reduced} />
  }

  return <RequestResetForm reduced={reduced} />
}

function RequestResetForm({ reduced }: { reduced: boolean }) {
  const { submit, loading, sent, error } = useRequestPasswordReset()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = (data: ForgotForm) => submit(data.email)

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
                <Lock className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
              <p className="text-sm text-neutral-400 mt-2">
                No worries. Enter your email and we'll send you a reset link.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {sent ? (
                <motion.div
                  initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    If an account exists with that email, you'll receive a password reset link shortly.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to login
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-neutral-300">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}

function ResetPasswordForm({ token, reduced }: { token: string; reduced: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const newPasswordValue = watch('newPassword', '')

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    setError(null)
    try {
      await updatePassword(token, data.newPassword, data.confirmPassword)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

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
                <Lock className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Set new password</h1>
              <p className="text-sm text-neutral-400 mt-2">
                Enter your new password below.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {success ? (
                <motion.div
                  initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-white mb-2">Password updated</h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    Your password has been changed successfully.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to login
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm text-neutral-300">New password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Min. 8 chars, upper, lower, number, special"
                        className="pl-10"
                        {...register('newPassword')}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-red-400">{errors.newPassword.message}</p>
                    )}
                    {newPasswordValue.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {[
                          { label: '8+ characters', met: newPasswordValue.length >= 8 },
                          { label: 'Uppercase letter', met: /[A-Z]/.test(newPasswordValue) },
                          { label: 'Lowercase letter', met: /[a-z]/.test(newPasswordValue) },
                          { label: 'Number', met: /[0-9]/.test(newPasswordValue) },
                          { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue) },
                        ].map(({ label, met }) => (
                          <p key={label} className={`text-xs ${met ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {met ? '✓' : '○'} {label}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-neutral-300">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        className="pl-10"
                        {...register('confirmPassword')}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}
