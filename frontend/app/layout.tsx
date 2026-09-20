"use client";
import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

type UserProfile = {
  full_name: string;
  role: "recruiter" | "candidate";
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const isRecruiter = pathname.startsWith("/recruiter");
  const isCandidate = pathname.startsWith("/candidate");
  const isPortal = isRecruiter || isCandidate;

  useEffect(() => {
    if (!isPortal) return;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      setEmail(data.user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        setProfile({
          full_name:
            data.user.user_metadata?.full_name || "User",
          role: isRecruiter ? "recruiter" : "candidate",
        });
      }
    }

    loadUser();
  }, [isPortal, isRecruiter]);

  async function handleSignOut() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      setSigningOut(false);
      return;
    }

    window.location.href = "/auth";
  }

  function getCurrentPage() {
    if (pathname.includes("/jobs/create")) {
      return "Create Job";
    }

    if (pathname.includes("/applicants/ai")) {
      return "AI Candidate Intelligence";
    }

    if (pathname.includes("/applicants/view")) {
      return "Candidate Profile";
    }

    if (pathname.includes("/applicants")) {
      return "Candidate Management";
    }

    if (pathname.includes("/jobs")) {
      return "Job Opportunities";
    }

    if (pathname.includes("/resume")) {
      return "Resume Intelligence";
    }

    if (isRecruiter) {
      return "Recruiter Command Center";
    }

    return "Candidate Workspace";
  }

  if (!isPortal) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  const displayName =
    profile?.full_name ||
    (isRecruiter ? "Rohan Mehta" : "Aarav Patil");

  return (
    <html lang="en">
      <body>
        <div className="portal-app">

          {/* =====================================================
              ANIMATED BACKGROUND
          ====================================================== */}

          <div className="portal-background">
            <div className="portal-orb orb-one" />
            <div className="portal-orb orb-two" />
            <div className="portal-orb orb-three" />

            <div className="portal-grid" />

            <div className="portal-stars">
              {Array.from({ length: 30 }).map((_, index) => (
                <span
                  key={index}
                  className="portal-star"
                  style={{
                    left: `${(index * 37) % 100}%`,
                    top: `${(index * 61) % 100}%`,
                    animationDelay: `${(index % 8) * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* =====================================================
              SIDEBAR
          ====================================================== */}

          <aside className="portal-sidebar">

            <div className="portal-brand">
              <div className="brand-mark">
                P
              </div>

              <div>
                <div className="brand-title">
                  PlacementOS
                </div>

                <div className="brand-subtitle">
                  AI RECRUITMENT OS
                </div>
              </div>
            </div>

            {/* AI CORE */}

            <div className="ai-core-card">

              <div className="ai-core">

                <div className="core-ring core-ring-one" />
                <div className="core-ring core-ring-two" />
                <div className="core-ring core-ring-three" />

                <div className="core-center">
                  AI
                </div>

              </div>

              <div className="core-status">
                <span className="status-dot" />
                AI CORE ONLINE
              </div>

              <div className="core-description">
                Autonomous hiring intelligence
              </div>

            </div>

            {/* NAVIGATION */}

            <div className="portal-nav-title">
              WORKSPACE
            </div>

            <nav className="portal-navigation">

              {isRecruiter ? (
                <>
                  <Link
                    href="/recruiter"
                    className={
                      pathname === "/recruiter"
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>⌂</span>
                    Dashboard
                  </Link>

                  <Link
                    href="/recruiter/jobs/create"
                    className={
                      pathname.includes("/jobs/create")
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>＋</span>
                    Create Job
                  </Link>

                  <Link
                    href="/recruiter/applicants"
                    className={
                      pathname.includes("/applicants")
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>◎</span>
                    Applicants
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/candidate"
                    className={
                      pathname === "/candidate"
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>⌂</span>
                    Dashboard
                  </Link>

                  <Link
                    href="/candidate/jobs"
                    className={
                      pathname.includes("/jobs")
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>◈</span>
                    Job Opportunities
                  </Link>

                  <Link
                    href="/candidate/resume"
                    className={
                      pathname.includes("/resume")
                        ? "portal-nav-item active"
                        : "portal-nav-item"
                    }
                  >
                    <span>▣</span>
                    Resume
                  </Link>
                </>
              )}

            </nav>

            {/* SYSTEM CARD */}

            <div className="system-card">

              <div className="system-header">
                <span>System Status</span>
                <span className="system-live">
                  LIVE
                </span>
              </div>

              <div className="system-line">
                <span>Supabase</span>
                <span className="system-ok">
                  ●
                </span>
              </div>

              <div className="system-line">
                <span>AI Engine</span>
                <span className="system-ok">
                  ●
                </span>
              </div>

              <div className="system-line">
                <span>Database</span>
                <span className="system-ok">
                  ●
                </span>
              </div>

            </div>

          </aside>

          {/* =====================================================
              TOP BAR
          ====================================================== */}

          <header className="portal-topbar">

            <div className="topbar-left">

              <div className="breadcrumb-main">
                {getCurrentPage()}
              </div>

              <div className="breadcrumb-status">
                <span className="status-dot" />
                Workspace active
              </div>

            </div>

            <div className="topbar-right">

              <div className="ai-online">
                <span className="pulse-dot" />
                AI ONLINE
              </div>

              <div className="user-card">

                <div className="user-avatar">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="user-info">

                  <div className="user-name">
                    {displayName}
                  </div>

                  <div className="user-role">
                    {isRecruiter
                      ? "RECRUITER"
                      : "CANDIDATE"}
                  </div>

                </div>

              </div>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="signout-button"
              >
                <span>↪</span>

                {signingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>

            </div>

          </header>

          {/* =====================================================
              PAGE CONTENT
          ====================================================== */}

          <main className="portal-content">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}