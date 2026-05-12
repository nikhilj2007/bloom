"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";
import type { InteractiveActivity } from "@/lib/learnContent";

export function InteractiveActivityBlock({ activity }: { activity?: InteractiveActivity }) {
  if (!activity) return null;

  if (activity.type === "multiple-choice") {
    return <MultipleChoiceBlock activity={activity} />;
  }
  
  if (activity.type === "survey") {
    return <SurveyBlock activity={activity} />;
  }

  if (activity.type === "drag-and-drop") {
    return <DragDropBlock activity={activity} />;
  }

  return null;
}

function MultipleChoiceBlock({ activity }: { activity: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === activity.correctAnswer;

  return (
    <div className="bg-white rounded-xl border border-[#D0E8D0] p-6 shadow-sm my-8 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-[#3E863E] uppercase tracking-wider mb-2">
        Knowledge Check
      </div>
      <h3 className="font-heading font-semibold text-lg">{activity.question}</h3>
      <div className="space-y-2 mt-4">
        {activity.options.map((option: string) => {
          let stateClass = "border-slate-200 hover:border-[#A8D4A8] hover:bg-[#fafdfa]";
          if (submitted) {
            if (option === activity.correctAnswer) {
              stateClass = "border-emerald-500 bg-emerald-50";
            } else if (option === selected) {
              stateClass = "border-red-300 bg-red-50 text-red-900";
            } else {
              stateClass = "border-slate-200 opacity-50";
            }
          } else if (selected === option) {
            stateClass = "border-[#3E863E] bg-[#f0f7f0]";
          }

          return (
            <button
              key={option}
              disabled={submitted}
              onClick={() => setSelected(option)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${stateClass} flex items-center justify-between`}
            >
              <span>{option}</span>
              {submitted && option === activity.correctAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {submitted && option === selected && option !== activity.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button 
          onClick={() => setSubmitted(true)}
          disabled={!selected}
          className="w-full mt-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
        >
          Submit Answer
        </button>
      ) : (
        <div className={`mt-4 p-4 rounded-xl text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
          <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
          {activity.explanation && <p className="opacity-90">{activity.explanation}</p>}
        </div>
      )}
    </div>
  );
}

function SurveyBlock({ activity }: { activity: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm my-8 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
        Quick Poll
      </div>
      <h3 className="font-heading font-semibold text-lg">{activity.question}</h3>
      <div className="space-y-2 mt-4">
        {activity.options.map((option: string) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              disabled={submitted}
              onClick={() => setSelected(option)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button 
          onClick={() => setSubmitted(true)}
          disabled={!selected}
          className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          Vote
        </button>
      ) : (
        <div className="mt-4 p-4 rounded-xl text-sm bg-blue-50 text-blue-900 border border-blue-200">
          <p className="font-semibold">Thanks for sharing!</p>
          <p className="opacity-90 mt-1">We use these polls to understand how other college students are approaching their finances.</p>
        </div>
      )}
    </div>
  );
}

function DragDropBlock({ activity }: { activity: any }) {
  const [items, setItems] = useState<{id: string; content: string; category: string | null}[]>(
    activity.items.map((i: any) => ({ ...i, category: null }))
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("itemId", itemId);
  };

  const handleDrop = (e: React.DragEvent, category: string | null) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, category } : item));
    setIsSubmitted(false);
  };

  const checkAnswers = () => setIsSubmitted(true);

  return (
    <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm my-8">
      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
        Interactive Match
      </div>
      <h3 className="font-heading font-semibold text-lg mb-2">{activity.title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{activity.instructions}</p>
      
      {/* Uncategorized Items */}
      <div 
        className="min-h-[80px] p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg mb-6 flex flex-wrap gap-2 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, null)}
      >
        {items.filter(i => i.category === null).map(item => (
          <div 
            key={item.id} 
            draggable 
            onDragStart={(e) => handleDragStart(e, item.id)}
            className="cursor-grab active:cursor-grabbing px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-md text-sm flex items-center gap-2 select-none hover:border-purple-300 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
            {item.content}
          </div>
        ))}
        {items.filter(i => i.category === null).length === 0 && (
          <div className="w-full text-center text-sm text-slate-400 italic">All items categorized! Check your answers below.</div>
        )}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {activity.categories.map((cat: string) => (
          <div 
            key={cat}
            className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl min-h-[120px] transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, cat)}
          >
            <h4 className="font-semibold text-sm mb-3 text-purple-700 text-center">{cat}</h4>
            <div className="flex flex-col gap-2">
              {items.filter(i => i.category === cat).map(item => {
                const isCorrect = activity.items.find((orig: any) => orig.id === item.id)?.correctCategory === cat;
                return (
                  <div 
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    className={`cursor-grab active:cursor-grabbing px-3 py-2 bg-white border shadow-sm rounded-md text-sm flex items-center justify-between gap-2 select-none transition-colors ${isSubmitted ? (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-red-400 bg-red-50 text-red-900') : 'border-slate-200 hover:border-purple-300'}`}
                  >
                    <span className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      {item.content}
                    </span>
                    {isSubmitted && (
                      isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={checkAnswers}
        disabled={items.some(i => i.category === null) || isSubmitted}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitted ? "Submitted!" : "Check Answers"}
      </button>
    </div>
  );
}
