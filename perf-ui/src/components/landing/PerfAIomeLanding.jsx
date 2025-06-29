import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Search,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Play,
  Zap,
  Heart,
  TrendingUp,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export default function PerfAIomeLanding() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const { loginWithRedirect } = useAuth0();

  const redirectToSignUp = () => {
    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
    });
  };

  const colors = {
    white: "#FFFFFF", // Main background
    deepViolet: "#5E35B1", // Primary accent
    midnightPurple: "#1A0A2A", // Main text & dark elements
    lightLavender: "#D1C4E9", // Hover & light accents
  };

  const testimonials = [
    {
      name: "Sebiha Madanska",
      role: "Fragrance Enthusiast",
      content:
        "This app completely transformed how I discover new scents. The recommendations are spot-on!",
      rating: 5,
    },
    {
      name: "Veselina Naneva",
      role: "Perfume Collector",
      content:
        "The news feed keeps me updated on everything happening in the fragrance world. Absolutely love it!",
      rating: 5,
    },
    {
      name: "Yordan Todorov",
      role: "Beauty Blogger",
      content:
        "Finally, an app that understands my scent preferences. The AI recommendations are incredible.",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Recommendations",
      description:
        "Get personalized fragrance suggestions based on your preferences, mood, and occasions.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Curated News Feed",
      description:
        "Stay updated with the latest fragrance releases, reviews, and industry insights.",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Discovery",
      description:
        "Explore thousands of fragrances with advanced filtering and search capabilities.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[id]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.white }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 w-full backdrop-blur-md border-b z-50"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Corrected to White with opacity
          borderColor: colors.lightLavender,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.midnightPurple }}
              >
                <Sparkles className="w-5 h-5" style={{ color: colors.white }} />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: colors.midnightPurple }}
              >
                Perf-AI-ome
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="transition-colors"
                style={{ color: colors.midnightPurple }}
                onMouseEnter={(e) => (e.target.style.color = colors.deepViolet)}
                onMouseLeave={(e) =>
                  (e.target.style.color = colors.midnightPurple)
                }
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition-colors"
                style={{ color: colors.midnightPurple }}
                onMouseEnter={(e) => (e.target.style.color = colors.deepViolet)}
                onMouseLeave={(e) =>
                  (e.target.style.color = colors.midnightPurple)
                }
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="transition-colors"
                style={{ color: colors.midnightPurple }}
                onMouseEnter={(e) => (e.target.style.color = colors.deepViolet)}
                onMouseLeave={(e) =>
                  (e.target.style.color = colors.midnightPurple)
                }
              >
                Reviews
              </a>
              <Button
                variant="outline"
                className="border-2"
                style={{
                  borderColor: colors.midnightPurple,
                  color: colors.midnightPurple,
                  backgroundColor: "transparent",
                }}
                onClick={loginWithRedirect}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = colors.lightLavender)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                Sign In
              </Button>
              <Button
                className="hover:opacity-90"
                onClick={redirectToSignUp}
                style={{
                  backgroundColor: colors.midnightPurple,
                  color: colors.white,
                }}
              >
                Join Perf-AI-ome
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: colors.lightLavender,
                color: colors.midnightPurple,
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Fragrance Discovery
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ color: colors.midnightPurple }}
            >
              Discover Your
              <br />
              <span style={{ color: colors.deepViolet }}>Perfect Scent</span>
            </h1>
            <p
              className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed"
              style={{ color: colors.midnightPurple, opacity: 0.8 }}
            >
              Unlock the world of fragrances with personalized recommendations,
              expert reviews, and the latest news from the perfume industry.
              Your scent journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="hover:opacity-90 text-lg px-8 py-6 h-auto"
                style={{
                  backgroundColor: colors.midnightPurple,
                  color: colors.white,
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Join Perf-AI-ome Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-lg px-8 py-6 h-auto"
                style={{
                  borderColor: colors.midnightPurple,
                  color: colors.midnightPurple,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = colors.lightLavender)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse News Feed
              </Button>
            </div>

            {/* Hero Visual */}
            <div className="relative max-w-4xl mx-auto">
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                style={{ backgroundColor: colors.deepViolet }}
              ></div>
              <div
                className="relative rounded-3xl p-8 shadow-2xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full"
                    style={{ backgroundColor: colors.lightLavender }}
                  >
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.midnightPurple }}
                      >
                        <Heart
                          className="w-6 h-6"
                          style={{ color: colors.white }}
                        />
                      </div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.midnightPurple }}
                      >
                        Personal Matches
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.midnightPurple, opacity: 0.7 }}
                      >
                        AI finds your perfect fragrance match
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full"
                    style={{ backgroundColor: colors.lightLavender }}
                  >
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.midnightPurple }}
                      >
                        <TrendingUp
                          className="w-6 h-6"
                          style={{ color: colors.white }}
                        />
                      </div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.midnightPurple }}
                      >
                        Latest Trends
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.midnightPurple, opacity: 0.7 }}
                      >
                        Stay updated with fragrance news
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full"
                    style={{ backgroundColor: colors.lightLavender }}
                  >
                    <CardContent className="p-6 flex flex-col justify-center items-center text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.midnightPurple }}
                      >
                        <Users
                          className="w-6 h-6"
                          style={{ color: colors.white }}
                        />
                      </div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.midnightPurple }}
                      >
                        Community
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.midnightPurple, opacity: 0.7 }}
                      >
                        Connect with fragrance lovers
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: colors.deepViolet }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: colors.white }}
            >
              Why Choose{" "}
              <span style={{ color: colors.lightLavender }}>Perf-AI-ome</span>
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.white, opacity: 0.9 }}
            >
              Experience the future of fragrance discovery with cutting-edge AI
              technology and curated content from industry experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-4 ${isVisible.features ? "animate-fade-in" : "opacity-0"}`}
                style={{
                  backgroundColor: colors.white,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center transform hover:scale-110 transition-transform duration-300 flex-shrink-0"
                    style={{ backgroundColor: colors.midnightPurple }}
                  >
                    <div style={{ color: colors.white }}>{feature.icon}</div>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: colors.midnightPurple }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.midnightPurple, opacity: 0.7 }}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: colors.midnightPurple }}
            >
              How It <span style={{ color: colors.deepViolet }}>Works</span>
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.midnightPurple, opacity: 0.8 }}
            >
              Your journey to finding the perfect fragrance is just three simple
              steps away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="text-center group">
                <div className="relative mb-8">
                  <div
                    className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold transform group-hover:scale-110 transition-all duration-300"
                    style={{
                      backgroundColor: colors.midnightPurple,
                      color: colors.white,
                    }}
                  >
                    {step}
                  </div>
                  <div
                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full animate-pulse"
                    style={{ backgroundColor: colors.deepViolet }}
                  ></div>
                </div>
                <h3
                  className="text-2xl font-semibold mb-4"
                  style={{ color: colors.midnightPurple }}
                >
                  {
                    [
                      "Share Your Preferences",
                      "Get AI Recommendations",
                      "Explore & Discover",
                    ][index]
                  }
                </h3>
                <p
                  className="text-lg"
                  style={{ color: colors.midnightPurple, opacity: 0.7 }}
                >
                  {
                    [
                      "Tell us about your favorite scents, occasions, and fragrance family preferences.",
                      "Our advanced AI analyzes your preferences and suggests perfect matches from thousands of fragrances.",
                      "Browse the latest news and deep dive into the fragrance world.",
                    ][index]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: colors.deepViolet }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: colors.white }}
            >
              What Our Users{" "}
              <span style={{ color: colors.lightLavender }}>Say</span>
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.white, opacity: 0.9 }}
            >
              Join thousands of fragrance enthusiasts who have transformed their
              scent discovery journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card
              className="border-0 shadow-2xl overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 fill-current"
                          style={{ color: colors.midnightPurple }}
                        />
                      )
                    )}
                  </div>
                  <blockquote
                    className="text-2xl md:text-3xl font-light mb-8 italic leading-relaxed"
                    style={{ color: colors.midnightPurple }}
                  >
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-semibold text-lg"
                        style={{
                          backgroundColor: colors.midnightPurple,
                          color: colors.white,
                        }}
                      >
                        {testimonials[currentTestimonial].name.charAt(0)}
                      </div>
                      <h4
                        className="font-semibold text-lg"
                        style={{ color: colors.midnightPurple }}
                      >
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p style={{ color: colors.midnightPurple, opacity: 0.7 }}>
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? "scale-125" : "opacity-50 hover:opacity-75"}`}
                  style={{ backgroundColor: colors.midnightPurple }}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="rounded-3xl p-16 shadow-2xl"
            style={{ backgroundColor: colors.midnightPurple }}
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: colors.white }}
            >
              Ready to Find Your Signature Scent?
            </h2>
            <p
              className="text-xl mb-8 opacity-90 max-w-3xl mx-auto"
              style={{ color: colors.white }}
            >
              Join thousands of fragrance lovers who trust Perf-AI-ome to
              discover their perfect match. Start your personalized fragrance
              journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto hover:opacity-90"
                onClick={redirectToSignUp}
                style={{
                  backgroundColor: colors.white,
                  color: colors.midnightPurple,
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-lg px-8 py-6 h-auto"
                style={{
                  backgroundColor: "transparent",
                  color: colors.white,
                  borderColor: colors.white,
                }}
                onClick={loginWithRedirect}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.white;
                  e.target.style.color = colors.midnightPurple;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = colors.white;
                }}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Sign In to Explore
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
