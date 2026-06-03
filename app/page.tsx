import { getQuestionsPage } from "@/lib/questions";

export default async function Page() {
  const { questions } = await getQuestionsPage(0, 10);

  return (
    <main>
      <h1>Questions Loaded</h1>
      <p>{questions.length}</p>
    </main>
  );
}