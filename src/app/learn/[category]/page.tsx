import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, PlayCircle, Clock } from "lucide-react";
import * as Icons from "lucide-react";
import { learnCategories } from "@/lib/learnContent";

export async function generateStaticParams() {
  return learnCategories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = learnCategories.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const IconComponent = (Icons as any)[category.iconName] || Icons.BookOpen;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 md:pb-10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Back Link */}
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#2d6a2d] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Learn
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-2xl border border-[#D0E8D0] p-6 sm:p-8 card-soft space-y-4">
          <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-md">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold">{category.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">{category.description}</p>
          </div>
          {/* Progress visual */}
          <div className="pt-3">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-[#3E863E]">0% completed</span>
              <span className="text-muted-foreground">{category.modules.length} modules</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E0F0E0] overflow-hidden">
              <div className="h-full rounded-full gradient-brand w-0 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">Modules</h2>
          <div className="grid gap-3">
            {category.modules.map((module, index) => (
              <Link key={module.slug} href={`/learn/${category.slug}/${module.slug}`}>
                <div className="bg-white rounded-xl border border-[#D0E8D0] p-4 flex items-center gap-4 hover:border-[#A8D4A8] hover:bg-[#fafdfa] transition-all group shadow-sm hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-[#f0f7f0] border border-[#A8D4A8] flex items-center justify-center shrink-0 text-[#2d6a2d] font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-[#2d6a2d] transition-colors">
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {module.readingTime}</span>
                      {module.youtubeUrl && <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> Video included</span>}
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#3E863E] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
