'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '~/lib/auth-client';
import { toast } from 'sonner';

export default function LoginComponent() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const [userId, setUserID] = React.useState('');
  const [password, setPassword] = React.useState('');

  async function onLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signIn.username({
        username: userId,
        password: password
      });

      if (res.error) {
        toast.error('Login failed: ' + res.error.message);
        setPassword('');
      } else {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center py-10">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            <CardTitle className="text-lg">Login to Nirmal Setu</CardTitle>
          </div>

          <CardDescription>Welcome back. Use your email to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.form
            onSubmit={onLoginSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                type="text"
                placeholder="your-username"
                required
                value={userId}
                onChange={(e) => setUserID(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button type="button" variant="link" className="px-0" disabled={loading}>
                Forgot password?
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => {
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: window.location.origin + '/user_dashboard'
                });
              }}
            >
              <span className="inline-flex items-center gap-2">
                <FcGoogle className="size-5" /> Continue with Google
              </span>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Dont have an account?{' '}
              <Button type="button" variant="link" className="px-1" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </motion.form>
        </CardContent>
      </Card>
    </div>
  );
}
