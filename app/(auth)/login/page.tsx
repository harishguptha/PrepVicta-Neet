"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [tab, setTab] = useState<"email" | "mobile">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const result = await login(identifier, password);
    if (result.success) {
      router.push(result.redirect);
    } else {
      setError(result.error ?? "Login failed.");
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
                Secure access.
                <br />
                Zero distractions.
              </div>
              <div className={styles.heroSub}>
                Log in to continue your personalized NEET preparation journey with smart planning, revision, and test insights.
              </div>

              <div className={styles.bullets}>
                {[
                  { icon: "verified_user", title: "Institution access", desc: "Credentials are provided by your institute." },
                  { icon: "schedule", title: "Faster onboarding", desc: "Answer 4 quick questions once." },
                  { icon: "insights", title: "Actionable guidance", desc: "Know what to study next, every day." },
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
                <div className={styles.mobileSub}>Secure Access Portal</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.topBar} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>Sign in</div>
                <div className={styles.cardSub}>Welcome back! Enter your credentials to continue.</div>

                {error && (
                  <div className={styles.error}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      error
                    </span>
                    <div>{error}</div>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.segmented}>
                    <button
                      type="button"
                      onClick={() => setTab("email")}
                      className={`${styles.segBtn} ${tab === "email" ? styles.segBtnActive : ""}`}
                    >
                      EMAIL
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("mobile")}
                      className={`${styles.segBtn} ${tab === "mobile" ? styles.segBtnActive : ""}`}
                    >
                      MOBILE
                    </button>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="identifier">{tab === "email" ? "Email address" : "Mobile number"}</label>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>
                        {tab === "email" ? "mail" : "phone"}
                      </span>
                      <input
                        className={styles.input}
                        id="identifier"
                        name="identifier"
                        placeholder={tab === "email" ? "student@prepvicta.com" : "+91 98765 43210"}
                        required
                        type={tab === "email" ? "email" : "tel"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoComplete={tab === "email" ? "email" : "tel"}
                        inputMode={tab === "email" ? "email" : "tel"}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.fieldRow}>
                      <label htmlFor="password">Password</label>
                      <a className={styles.link} href="#">
                        Forgot password? (OTP)
                      </a>
                    </div>
                    <div className={styles.inputWrap}>
                      <span className={`material-symbols-outlined ${styles.leadingIcon}`}>key</span>
                      <input
                        className={styles.input}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
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
                    {submitting ? "SIGNING IN..." : "SECURE LOGIN"}
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {submitting ? "progress_activity" : "arrow_forward"}
                    </span>
                  </button>
                </form>
              </div>

              <div className={styles.cardFooter}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  person_add
                </span>
                <span>
                  New to PrepVicta?{" "}
                  <Link href="/signup" className={styles.link}>
                    Create an account
                  </Link>
                </span>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <Link className={styles.mutedLink} href="#">
                Privacy Policy
              </Link>
              <span className={styles.dot}>•</span>
              <Link className={styles.mutedLink} href="#">
                Support Helpdesk
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
