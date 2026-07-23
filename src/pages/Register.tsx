import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Briefcase, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { cn } from '@/lib/utils'
import PageShell from '@/components/layout/PageShell'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'sonner'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character (!@#$%^&*)'),
  confirmPassword: z.string(),
  role: z.enum(['job_seeker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer'>('job_seeker')
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'job_seeker' },
  })

  const passwordValue = watch('password', '')

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true)
    const result = await registerUser({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    })
    setIsLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <PageShell showFooter={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <Logo width={56} height={56} className="mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Account</h1>
              <p className="text-sm text-neutral-400 mt-2">Join LoftCommunity today</p>
            </div>

            {/* OAuth (Google, LinkedIn) — not yet implemented */}

            <div className="mb-6">
              <Label className="text-sm text-neutral-300 mb-3 block">I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('job_seeker'); setValue('role', 'job_seeker') }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                    selectedRole === 'job_seeker'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20'
                  )}
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm font-medium">Find a Job</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('employer'); setValue('role', 'employer') }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                    selectedRole === 'employer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20'
                  )}
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="text-sm font-medium">Hire Talent</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-neutral-300">First Name</Label>
                  <Input id="firstName" placeholder="John" {...register('firstName')} className={errors.firstName ? 'ring-2 ring-red-500' : ''} />
                  {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-neutral-300">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" {...register('lastName')} className={errors.lastName ? 'ring-2 ring-red-500' : ''} />
                  {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm text-neutral-300">Email</Label>
                <Input id="reg-email" type="email" placeholder="name@example.com" {...register('email')} className={errors.email ? 'ring-2 ring-red-500' : ''} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm text-neutral-300">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, upper, lower, number, special"
                    {...register('password')}
                    className={`pr-10 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                {passwordValue.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {[
                      { label: '8+ characters', met: passwordValue.length >= 8 },
                      { label: 'Uppercase letter', met: /[A-Z]/.test(passwordValue) },
                      { label: 'Lowercase letter', met: /[a-z]/.test(passwordValue) },
                      { label: 'Number', met: /[0-9]/.test(passwordValue) },
                      { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) },
                    ].map(({ label, met }) => (
                      <p key={label} className={`text-xs ${met ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {met ? '✓' : '○'} {label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-neutral-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'ring-2 ring-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-400"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm text-neutral-400 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageShell>
  )
}
