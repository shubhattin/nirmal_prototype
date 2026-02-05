'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import {
  Sparkles,
  MessageSquarePlus,
  Gauge,
  ShieldCheck,
  Gamepad2,
  ArrowRight,
  Zap,
  Target,
  Globe,
  Users
} from 'lucide-react';
import { useRef, Suspense, useEffect, useState } from 'react';

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-cyan-900/20 to-green-900/20"
      />

      {/* Floating Particles */}
      <FloatingParticles />

      <div className="relative z-10 space-y-0">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CallToActionSection />
      </div>
    </div>
  );
}

function FloatingParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-green-500"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  );
}

function AnimatedSphere() {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#10B981"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
        />
      </Sphere>
    </Float>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center px-6 py-20"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-green-500/20 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">AI-Powered Waste Management</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-6xl leading-tight font-black lg:text-8xl"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-500 to-green-400 bg-clip-text text-transparent">
              Nirmal Setu
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-2xl font-bold text-gray-300 lg:text-3xl"
          >
            Revolutionizing Urban Cleanliness
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
            className="max-w-2xl text-xl leading-relaxed text-gray-400"
          >
            Transform your city with our AI-driven platform that seamlessly connects citizens,
            municipal bodies, and technology for unprecedented waste management efficiency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-gradient-to-r from-emerald-700 to-green-800 px-6 py-3 text-sm font-medium shadow-md transition-all duration-300 hover:from-emerald-600 hover:to-green-700"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium transition-all duration-300 hover:border-gray-500 hover:bg-gray-800/50"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 3D Animated Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
          className="relative"
        >
          <div className="relative h-96 w-full lg:h-[500px]">
            {/* Glowing orbs */}
            <motion.div
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-green-600 opacity-60 blur-xl"
            />

            <motion.div
              animate={{
                y: [20, -20, 20],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
              className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 opacity-40 blur-xl"
            />

            {/* Central feature mockup */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  rotateX: -5
                }}
                className="relative h-80 w-80 rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-green-600">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">ShuchiAI Assistant</h3>
                      <p className="text-sm text-gray-400">Online</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-700 p-3">
                      <p className="text-sm text-gray-300">
                        How can I help optimize waste collection in your area?
                      </p>
                    </div>

                    <div className="ml-8 rounded-lg bg-gradient-to-r from-cyan-600 to-green-600 p-3">
                      <p className="text-sm text-white">Show me priority areas for today</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="h-2 w-2 rounded-full bg-green-400"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-gray-400"
        >
          <p className="mb-2 text-sm">Scroll to explore</p>
          <div className="mx-auto h-8 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return null;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { icon: Users, label: 'Cities Connected', value: '50+', color: 'from-cyan-600 to-emerald-500' },
    {
      icon: Target,
      label: 'Issues Resolved',
      value: '10K+',
      color: 'from-green-500 to-emerald-500'
    },
    { icon: Globe, label: 'Coverage Area', value: '25M+', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Response Time', value: '<2h', color: 'from-orange-500 to-red-500' }
  ];

  return (
    <section ref={ref} className="relative px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-black lg:text-5xl">
            <span className="bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">
              Transforming Cities
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-400">
            Real impact, measurable results. See how Nirmal Setu is revolutionizing waste management
            across urban landscapes.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group text-center"
            >
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${stat.color} mb-4 transition-all duration-300 group-hover:shadow-lg`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.2 + 0.5, type: 'spring', stiffness: 200 }}
                className="mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-black text-transparent"
              >
                {stat.value}
              </motion.div>
              <p className="font-medium text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: MessageSquarePlus,
      title: 'Smart Complaint System',
      description:
        'AI-powered issue detection with image recognition, geo-tagging, and automatic categorization. Citizens earn points for proactive reporting.',
      gradient: 'from-cyan-600 via-teal-600 to-green-600',
      mockup: 'complaint'
    },
    {
      icon: Gauge,
      title: 'Intelligent Dashboard + ShuchiAI',
      description:
        "Real-time analytics, predictive insights, and conversational AI assistant that understands your locality's unique challenges.",
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
      mockup: 'dashboard'
    },
    {
      icon: ShieldCheck,
      title: 'Administrative Excellence',
      description:
        'Advanced admin console with AI-assisted prioritization, automated workflows, and performance analytics to boost resolution rates.',
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
      mockup: 'admin'
    },
    {
      icon: Gamepad2,
      title: 'Gamified Learning',
      description:
        'Interactive waste segregation training with AR experiences, challenges, and community leaderboards for environmental education.',
      gradient: 'from-orange-600 via-red-600 to-pink-600',
      mockup: 'game'
    }
  ];

  return (
    <section ref={ref} className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-8 text-5xl font-black lg:text-7xl">
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-500 to-green-400 bg-clip-text text-transparent">
              Revolutionary Features
            </span>
          </h2>
          <p className="mx-auto max-w-4xl text-2xl leading-relaxed text-gray-400">
            Experience the future of urban waste management with cutting-edge AI technology and
            intuitive design that transforms how cities operate.
          </p>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isInView
}: {
  feature: any;
  index: number;
  isInView: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -100 : 100 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.3, duration: 1.2, ease: 'easeOut' }}
      className={`grid grid-cols-1 items-center gap-16 lg:grid-cols-2 ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}
    >
      {/* Content */}
      <div className={`space-y-8 ${!isEven ? 'lg:col-start-2' : ''}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.3 + 0.3, type: 'spring', stiffness: 200 }}
          className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r ${feature.gradient} shadow-2xl`}
        >
          <feature.icon className="h-10 w-10 text-white" />
        </motion.div>

        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.3 + 0.5, duration: 1 }}
            className="mb-6 text-4xl leading-tight font-black lg:text-5xl"
          >
            <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
              {feature.title}
            </span>
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.3 + 0.7, duration: 1 }}
            className="mb-8 text-xl leading-relaxed text-gray-400"
          >
            {feature.description}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.3 + 0.9, duration: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-r px-6 py-3 ${feature.gradient} rounded-lg text-sm font-medium opacity-80 shadow-md transition-all duration-300 hover:opacity-100 hover:shadow-lg`}
          >
            Explore Feature
          </motion.button>
        </div>
      </div>

      {/* Visual Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: isEven ? -30 : 30 }}
        animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
        transition={{ delay: index * 0.3 + 0.4, duration: 1.5, ease: 'easeOut' }}
        className={`relative ${!isEven ? 'lg:col-start-1' : ''}`}
      >
        <div className="perspective-1000 relative h-96 w-full lg:h-[500px]">
          {/* Animated background elements */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-20 blur-3xl`}
          />

          {/* Main mockup container */}
          <motion.div
            whileHover={{
              rotateY: isEven ? 10 : -10,
              rotateX: -5,
              scale: 1.02
            }}
            className="relative h-full w-full rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 shadow-2xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <FeatureMockup type={feature.mockup} gradient={feature.gradient} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeatureMockup({ type, gradient }: { type: string; gradient: string }) {
  switch (type) {
    case 'complaint':
      return (
        <div className="flex h-full flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold text-white">Report Issue</h4>
            <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${gradient}`} />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex h-32 items-center justify-center rounded-xl bg-gray-700">
              <span className="text-gray-400">📸 Photo Evidence</span>
            </div>
            <div className="space-y-2">
              <div className="h-4 rounded-full bg-gray-700" />
              <div className="h-4 w-3/4 rounded-full bg-gray-700" />
            </div>
            <div
              className={`h-12 bg-gradient-to-r ${gradient} flex items-center justify-center rounded-xl`}
            >
              <span className="font-bold text-white">Submit Report</span>
            </div>
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className="h-full space-y-4">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-bold text-white">Analytics Dashboard</h4>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className={`h-6 w-6 rounded-full border-2 border-t-transparent border-r-transparent`}
              style={{ borderColor: `rgb(147, 197, 253)` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 rounded-lg bg-gray-700 p-4">
              <div className="text-xs text-gray-400">Active Issues</div>
              <div className="text-2xl font-bold text-white">247</div>
            </div>
            <div className="h-20 rounded-lg bg-gray-700 p-4">
              <div className="text-xs text-gray-400">Resolved</div>
              <div className="text-2xl font-bold text-green-400">1,847</div>
            </div>
          </div>
          <div className="flex h-24 items-center justify-center rounded-lg bg-gray-700">
            <span className="text-gray-400">📊 Real-time Analytics</span>
          </div>
        </div>
      );

    case 'admin':
      return (
        <div className="h-full space-y-4">
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white">Admin Console</h4>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-700 p-3">
                <div
                  className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-red-400' : i === 2 ? 'bg-yellow-400' : 'bg-green-400'}`}
                />
                <div className="flex-1">
                  <div className="mb-1 h-3 w-3/4 rounded bg-gray-600" />
                  <div className="h-2 w-1/2 rounded bg-gray-600" />
                </div>
                <div className="text-xs text-gray-400">
                  {i === 1 ? 'High' : i === 2 ? 'Med' : 'Low'}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'game':
      return (
        <div className="h-full space-y-6">
          <div className="text-center">
            <h4 className="mb-2 text-xl font-bold text-white">Waste Sorting Challenge</h4>
            <div className="text-sm text-gray-400">Level 5 - Hazardous Materials</div>
          </div>
          <div className="flex justify-center space-x-4">
            {['🍎', '🔋', '📰'].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-700 text-2xl"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Bio', 'Hazard', 'Recycle'].map((label, i) => (
              <div
                key={i}
                className={`flex h-12 items-center justify-center rounded-lg border-2 border-dashed border-gray-600 text-xs text-gray-400`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">⭐ 2,450 pts</div>
          </div>
        </div>
      );

    default:
      return <div className="h-full rounded-xl bg-gray-700" />;
  }
}

function CallToActionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative px-6 py-32">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 opacity-20 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 1, type: 'spring', stiffness: 200 }}
            className="text-6xl leading-tight font-black lg:text-8xl"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-500 to-green-400 bg-clip-text text-transparent">
              Ready to Transform
            </span>
            <br />
            <span className="text-white">Your City?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-2xl leading-relaxed text-gray-400"
          >
            Join the waste management revolution. Experience the future of urban cleanliness with
            AI-powered solutions that actually work.
          </motion.p>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex flex-col items-center justify-center gap-6 pt-8 sm:flex-row"
          >
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-emerald-600/30 bg-gradient-to-r from-emerald-700 to-green-800 px-8 py-4 text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-green-700"
            >
              Start Your Demo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-gray-600 px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:border-gray-500"
            >
              Contact Sales
            </motion.button>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}
