import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Target, CheckCircle2, Lightbulb } from "lucide-react";
import { learnCategories } from "@/lib/learnContent";
import { InteractiveActivityBlock } from "@/components/learn/InteractiveActivityBlock";

export async function generateStaticParams() {
  return learnCategories.flatMap((c) =>
    c.modules.map((m) => ({ category: c.slug, module: m.slug }))
  );
}

export default async function ModulePage({ params }: { params: Promise<{ category: string; module: string }> }) {
  const { category: categorySlug, module: moduleSlug } = await params;
  
  const category = learnCategories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const moduleIndex = category.modules.findIndex((m) => m.slug === moduleSlug);
  if (moduleIndex === -1) notFound();

  const module = category.modules[moduleIndex];
  const nextModule = category.modules[moduleIndex + 1];

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 md:pb-12">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Back Link */}
        <Link href={`/learn/${category.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#2d6a2d] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {category.title}
        </Link>

        {/* Module Header */}
        <div className="space-y-4">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">{module.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-white border border-[#D0E8D0] px-2.5 py-1 rounded-md shadow-sm">
              <Clock className="w-3.5 h-3.5" /> {module.readingTime}
            </span>
            <span className="bg-[#f0f7f0] text-[#2d6a2d] border border-[#A8D4A8] px-2.5 py-1 rounded-md font-medium">
              Lesson {moduleIndex + 1}
            </span>
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-xl border border-[#D0E8D0] p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
            <Target className="w-5 h-5 text-[#3E863E]" /> Learning Objectives
          </h3>
          <ul className="space-y-2.5">
            {module.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[#3E863E] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Video Embed */}
        {module.youtubeUrl && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-[#D0E8D0] bg-black">
            <iframe
              src={module.youtubeUrl}
              title={module.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Main Content */}
        <div className="prose prose-emerald max-w-none prose-p:leading-relaxed prose-p:text-foreground/90 text-sm sm:text-base">
          {module.content.split('\n\n').map((paragraph, i) => {
             if (!paragraph.trim()) return null;
             return <p key={i} className="mb-4">{paragraph.trim()}</p>;
          })}
        </div>

        {/* Interactive Activity */}
        <InteractiveActivityBlock activity={module.activity} />

        {/* Key Takeaways */}
        <div className="bg-[#fcfdfc] rounded-xl border border-[#D0E8D0] p-6 space-y-4 shadow-sm">
          <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-[#2d6a2d]">
            <Lightbulb className="w-5 h-5" /> Key Takeaways
          </h3>
          <ul className="space-y-3">
            {module.takeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8F5E8] text-[#3E863E] flex items-center justify-center font-bold text-xs mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/90 leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Step */}
        <div className="rounded-xl gradient-brand p-6 text-white shadow-lg space-y-3">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            Try This Now
          </h3>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            {module.actionStep}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[#D0E8D0] flex flex-col-reverse sm:flex-row gap-4 items-center justify-between">
          <Link href={`/learn/${category.slug}`} className="text-sm font-medium text-muted-foreground hover:text-[#2d6a2d] transition-colors w-full sm:w-auto text-center sm:text-left py-2">
            Exit Lesson
          </Link>
          {nextModule ? (
            <Link href={`/learn/${category.slug}/${nextModule.slug}`} className="w-full sm:w-auto px-6 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md">
              Next Module <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href={`/learn`} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-[#A8D4A8] text-[#2d6a2d] text-sm font-semibold hover:bg-[#f0f7f0] transition-colors flex items-center justify-center gap-2 shadow-sm">
              Back to Learn Hub
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
