import PollCard from "./polls/PollCard";

import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

// Render on every request (don't cache/prerender) so new questions show up.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

async function getPolls() {
  const res = await fetch("http://localhost:3000/api/polls", {
    cache: "no-store",
  });

  return res.json();
}

// Server component — runs only on the server, awaits the data, renders to HTML.
export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);
  const polls = await getPolls();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">Live Q&amp;A</h1>
      <>
 {polls.map((poll: any) => (
  <PollCard
    key={poll.id}
    poll={poll}
  />
))}
  <QuestionsList
    initialQuestions={questions}
    initialHasMore={hasMore}
  />
</>
    </main>
  );
}
