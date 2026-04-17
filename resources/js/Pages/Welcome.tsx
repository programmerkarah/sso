import { Database, LogIn, Shield, UserPlus, Zap } from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import AnimatedBackground from '@/Components/AnimatedBackground';
import AppIcon from '@/Components/AppIcon';
import FeatureCard from '@/Components/FeatureCard';

export default function Welcome() {
    return (
        <>
            <Head title="SSO" />

            <AnimatedBackground />

            <div className="relative min-h-screen">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-6xl">
                        {/* Header Section */}
                        <div className="mb-12 text-center">
                            <div className="mb-6 inline-block">
                                <div className="relative">
                                    {/* Icon Logo */}
                                    <div className="mb-6 flex justify-center">
                                        <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
                                            <AppIcon className="h-16 w-16 sm:h-20 sm:w-20" />
                                        </div>
                                    </div>
                                    {/* Title */}
                                    <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 blur-2xl"></div>
                                    <h1 className="relative bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-6xl font-black text-transparent drop-shadow-2xl sm:text-7xl md:text-8xl">
                                        SSO Sawahlunto
                                    </h1>
                                </div>
                            </div>
                            <p className="mx-auto max-w-2xl text-xl text-white/90 drop-shadow-lg sm:text-2xl">
                                Sistem Single Sign-On untuk BPS Kota Sawahlunto
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
                                <Shield className="h-4 w-4" />
                                <span>Aman</span>
                                <span className="text-white/40">•</span>
                                <Zap className="h-4 w-4" />
                                <span>Cepat</span>
                                <span className="text-white/40">•</span>
                                <Database className="h-4 w-4" />
                                <span>Terpusat</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-16 grid gap-6 sm:grid-cols-2">
                            <Link
                                href="/login"
                                className="group relative overflow-hidden rounded-2xl"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
                                <div className="relative flex items-center justify-center gap-4 rounded-2xl border border-white/30 bg-gradient-to-br from-blue-500/80 to-blue-600/80 px-8 py-6 backdrop-blur-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/50">
                                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                                        <LogIn className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold text-white">
                                            Masuk
                                        </div>
                                        <div className="text-sm text-white/90">
                                            Login ke akun Anda
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/register"
                                className="group relative overflow-hidden rounded-2xl"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
                                <div className="relative flex items-center justify-center gap-4 rounded-2xl border border-white/30 bg-gradient-to-br from-amber-500/80 to-orange-500/80 px-8 py-6 backdrop-blur-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/50">
                                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                                        <UserPlus className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold text-white">
                                            Daftar
                                        </div>
                                        <div className="text-sm text-white/90">
                                            Buat akun baru
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Features Grid */}
                        <div className="grid gap-6 md:grid-cols-3">
                            <FeatureCard
                                icon={Shield}
                                title="Aman"
                                description="Menggunakan protokol OAuth2 untuk keamanan maksimal"
                                iconColor="text-blue-300"
                            />
                            <FeatureCard
                                icon={Zap}
                                title="Cepat"
                                description="Login sekali untuk akses semua aplikasi"
                                iconColor="text-yellow-300"
                            />
                            <FeatureCard
                                icon={Database}
                                title="Terpusat"
                                description="Kelola semua akses aplikasi dari satu tempat"
                                iconColor="text-green-300"
                            />
                        </div>

                        {/* Footer */}
                        <div className="mt-16">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-xl">
                                <p className="text-sm text-white/60">
                                    © 2026 BPS Kota Sawahlunto. All rights
                                    reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
