"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import styles from "../auth.module.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const result = await register(name.trim(), email, password);
    if (result.success) {
      router.push(result.redirect);
    } else {
      setError(result.error ?? "Registration failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brandPanel}>
          <div className={styles.blobA} />
          <div className={styles.blobB} />
          <div className={styles.brandInner}>
            <div className={styles.brandTop}>
              <Image
                src="/prepvicta-logo.jpeg"
                alt="PrepVicta logo"
                width={52}
                height={52}
                className={styles.logo}
                priority
              />
              <div>
                <div className={styles.brandName}>PrepVicta</div>
                <div className={styles.brandTagline}>NEET learning, planned beautifully.</div>
              </div>
            </div>

            <div className={styles.brandHero}>
              <div className={styles.heroTitle}>
                Start your
                <br />
                NEET journey.
              </div>
              <div className={styles.heroSub}>
                Create your free account and get a personalized AI-powered study plan tailored to your goals.
              </div>

              <div className={styles.bullets}>
                {[
                  { icon: "auto_awesome", title: "AI-powered planner", desc: "Get daily study plans built around your schedule." },
                  { icon: "psychology", title: "Smart revision", desc: "Spaced repetition and Feynman technique built in." },
                  { icon: "emoji_events", title: "Track your progress", desc: "Monitor scores, streaks, and subject mastery." },
                ].map((b) => (
                  <div key={b.title} className={styles.bullet}>
                    <span className={`material-symbols-outlined ${styles.bulletIcon}`}>{b.icon}</span>
                    <div>
                      <div className={styles.bulletTitle}>{b.title}</div>
                      <div className={styles.bulletDesc}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.brandFooter}>© {new Date().getFullYear()} PrepVicta. All rights reserved.</div>
          </div>
        </aside>

        <main className={styles.formPanel}>
          <section className={styles.formWrap}>
            <div className={styles.mobileBrand}>
              <Image
                src="/prepvicta-logo.jpeg"
                alt="PrepVicta logo"
                width={44}
                height={44}
                className={styles.logo}
                priority
              />
              <div className={styles.mobileBrandText}>
                <div className={styles.mobileName}>PrepVicta</div>
                <div className={styles.mobileSub}>Create your account</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.topBar} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>Create account</div>
                <div className={styles.cardSub}>Join PrepVicta and start your personalized NEET preparation.</div>

                {error && (
                  <div className={styles.error}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
                    <div>{error}</div>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label htmlFor="name">Full name</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>person</span>
                      <input
                        className={styles.input}
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email">Email address</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>mail</span>
                      <input
                        className={styles.input}
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>key</span>
                      <input
                        className={styles.input}
                        id="password"
                        name="password"
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className={styles.trailingBtn}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {showPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className={styles.primaryBtn}>
                    {submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {submitting ? "progress_activity" : "arrow_forward"}
                    </span>
                  </button>
                </form>
              </div>

              <div className={styles.cardFooter}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                <span>
                  Already have an account?{" "}
                  <Link href="/login" className={styles.link}>
                    Sign in
                  </Link>
                </span>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <Link className={styles.mutedLink} href="#">Privacy Policy</Link>
              <span className={styles.dot}>•</span>
              <Link className={styles.mutedLink} href="#">Support Helpdesk</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
