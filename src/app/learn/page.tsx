import Link from "next/link";
import { ExternalLink, ChevronLeft } from "lucide-react";
import * as Icons from "lucide-react";
import { learnCategories } from "@/lib/learnContent";

export default function LearnHubPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 md:pb-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#2d6a2d] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Hero Section */}
        <section className="text-center py-6 space-y-4">
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
            Build Your <span className="gradient-brand-text">Money Confidence</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Learn practical, judgment-free money skills for college, careers, and financial independence.
          </p>
        </section>

        {/* Featured Resource */}
        <section>
          <a
            href="https://www.fidelity.com/learning-center/personal-finance/personal-finance-for-students"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-[#A8D4A8] bg-gradient-to-br from-[#e8f5e8] to-[#f0f7f0] p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a2d]">Featured Resource</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#3E863E]" />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold">Fidelity Student Finance Hub</h2>
                <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">
                  Explore Fidelity&apos;s comprehensive learning center designed specifically for students. Deep dive into credit, budgeting, and starting your investment journey.
                </p>
              </div>
            </div>
          </a>
        </section>

        {/* Categories Grid */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">Learning Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {learnCategories.map((category) => {
              const IconComponent = (Icons as any)[category.iconName] || Icons.BookOpen;
              return (
                <Link key={category.slug} href={`/learn/${category.slug}`}>
                  <div className="bg-white rounded-2xl border border-[#D0E8D0] p-5 card-soft hover:card-glow hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-sm shrink-0">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-heading font-bold text-lg">{category.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">
                      {category.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#3E863E]">
                      {category.modules.length} modules <Icons.ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
