import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, HardHat, LockKeyhole, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid work email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const onSubmit = async ({ email, password, rememberMe }: LoginFormValues) => {
    setServerError(null);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    }
  };

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true" />
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-mark"><HardHat size={24} strokeWidth={2.5} /></div>
        <p className="eyebrow"><ShieldCheck size={14} /> CONSTRUCTION OPERATIONS</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="login-intro">Sign in to keep your materials, projects, and site decisions moving.</p>

        {serverError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field-label" htmlFor="email">Work email</label>
          <div className={`input-shell ${errors.email ? 'has-error' : ''}`}>
            <Mail size={18} aria-hidden="true" />
            <input id="email" type="email" autoComplete="email" placeholder="name@company.com" {...register('email')} />
          </div>
          {errors.email && <p className="field-error">{errors.email.message}</p>}

          <label className="field-label" htmlFor="password">Password</label>
          <div className={`input-shell ${errors.password ? 'has-error' : ''}`}>
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}

          <div className="form-options">
            <label className="remember-option"><input type="checkbox" {...register('rememberMe')} /> <span>Remember me</span></label>
            <a href="mailto:administrator@company.com?subject=Con.AI%20password%20reset">Forgot password?</a>
          </div>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in to workspace'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <p className="login-footnote">Access is managed by your organization administrator.</p>
      </section>
    </main>
  );
}
