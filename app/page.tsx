import PollCard from "./polls/PollCard";
import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

async function getPolls() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://kealvi-nine.vercel.app";

  const res = await fetch(`${baseUrl}/api/polls`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const result = await res.json();
  return result.data || [];
}

export default async function Page() {
  const { questions, hasMore } =
    await getQuestionsPage(0, PAGE_SIZE);

  const polls = await getPolls();

  return (
    <main className="min-h-screen">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">

          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white shadow-indigo">
              K
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                Kealvi
              </div>

              <div className="hidden text-[11px] font-medium uppercase tracking-widest text-slate-400 sm:block">
                Live Q&A
              </div>
            </div>
          </a>

          <a
            href="/create-poll"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-indigo transition hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-base">+</span>
            Create Poll
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6">

        {/* HERO */}
        <section className="mb-10">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
            <span className="live-dot" />
            LIVE COMMUNITY
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Ask questions.
            <br />
            <span className="text-indigo-600">
              Start conversations.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            Share questions, participate in live polls and
            get AI-powered insights from your community.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#questions"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Explore Questions
            </a>

            <a
              href="/create-poll"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create a Poll →
            </a>
          </div>
        </section>

        {/* POLLS */}
        {Array.isArray(polls) && polls.length > 0 && (
          <section className="mb-12">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Live Polls
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Community Polls
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {polls.length} poll{polls.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-5">
              {polls.map((poll: any) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                />
              ))}
            </div>
          </section>
        )}

        {/* QUESTIONS */}
        <section id="questions">

          <div className="mb-5">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
              Community
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Live Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ask, upvote and explore what the community is discussing.
            </p>
          </div>

          <QuestionsList
            initialQuestions={questions}
            initialHasMore={hasMore}
          />

        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-slate-400">
          Kealvi · AI Powered Live Q&A and Polling Platform
        </div>
      </footer>

    </main>
  );
}