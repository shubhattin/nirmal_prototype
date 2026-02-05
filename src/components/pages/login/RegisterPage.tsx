'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '~/lib/auth-client';
import { toast } from 'sonner';

export default function RegisterComponent() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const [userId, setUserID] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [emailRegister, setEmailRegister] = React.useState('');

  async function onRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signUp.email({
        email: emailRegister,
        password: password,
        name: name,
        username: userId
      });

      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success('Account created successfully');
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
            <CardTitle className="text-lg">Create your Nirmal Setu account</CardTitle>
          </div>

          <CardDescription>Register with your email to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.form
            onSubmit={onRegisterSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-id-r">User ID</Label>
              <Input
                id="user-id-r"
                type="text"
                placeholder="your-username"
                required
                value={userId}
                onChange={(e) => setUserID(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-r">Email</Label>
              <Input
                id="email-r"
                type="email"
                placeholder="you@example.com"
                required
                value={emailRegister}
                onChange={(e) => setEmailRegister(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-r">Password</Label>
              <Input
                id="password-r"
                type="password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button type="button" variant="link" className="px-1" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </motion.form>
        </CardContent>
      </Card>
    </div>
  );
}
