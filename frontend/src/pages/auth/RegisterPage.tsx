import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Eye, EyeOff, HardHat, LockKeyhole, Mail, Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';

// admin is intentionally excluded — it can only be assigned by another admin
const publicRoles = ['user', 'manager'] as const;

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid work email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(publicRoles),
  rememberMe: z.boolean(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user', rememberMe: true },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerAccount(values.name, values.email, values.password, values.rememberMe, values.role);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to create account. Please try again.');
    }
  };

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true" />
      <section className="login-panel" aria-labelledby="register-title">
        <div className="brand-mark"><HardHat size={24} strokeWidth={2.5} /></div>
        <p className="eyebrow">CREATE YOUR ACCOUNT</p>
        <h1 id="register-title">Build with clarity.</h1>
        <p className="login-intro">Create an account and start managing construction materials in one place.</p>

        {serverError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Full name" id="name" error={errors.name?.message}>
            <div className={`input-shell ${errors.name ? 'has-error' : ''}`}>
              <UserRound size={18} aria-hidden="true" />
              <input id="name" autoComplete="name" placeholder="Your full name" {...register('name')} />
            </div>
          </Field>

          <Field label="Work email" id="email" error={errors.email?.message}>
            <div className={`input-shell ${errors.email ? 'has-error' : ''}`}>
              <Mail size={18} aria-hidden="true" />
              <input id="email" type="email" autoComplete="email" placeholder="name@company.com" {...register('email')} />
            </div>
          </Field>

          <Field label="Password" id="password" error={errors.password?.message}>
            <div className={`input-shell ${errors.password ? 'has-error' : ''}`}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
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
          </Field>

          <Field label="Role" id="role" error={errors.role?.message}>
            <div className={`input-shell ${errors.role ? 'has-error' : ''}`}>
              <Shield size={18} aria-hidden="true" />
              <select id="role" {...register('role')}>
                <option value="user">User — standard access</option>
                <option value="manager">Manager — full project access</option>
              </select>
            </div>
          </Field>

          <label className="remember-option register-remember">
            <input type="checkbox" {...register('rememberMe')} />
            <span>Keep me signed in on this device</span>
          </label>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <p className="login-footnote">Already have access? <Link to="/login">Sign in instead</Link></p>
      </section>
    </main>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
