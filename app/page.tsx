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
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);
  const polls = await getPolls();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">
        Live Q&amp;A
      </h1>

      {Array.isArray(polls) &&
        polls.map((poll: any) => (
          <PollCard
            key={poll.id}
            poll={poll}
          />
        ))}

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </main>
  );
}