"use client";

import { useMemo, useState } from "react";

type ChannelAnalysis = {
  channelId: string;
  channelUrl: string;
  channelTitle: string;
  sampleTitles: string[];
  sampleDescriptions: string[];
  averageTitleLength: number;
  topKeywords: string[];
  commonHashtags: string[];
  firstWordFrequency: Record<string, number>;
};

type SeoRecommendation = {
  recommendedTitle: string;
  recommendedDescription: string;
  recommendedHashtags: string[];
  keywordHighlights: string[];
};

type ApiResponse = {
  channelAnalyses: ChannelAnalysis[];
  aggregateKeywords: string[];
  aggregateHashtags: string[];
  aggregateFirstWords: string[];
  targetVideo?: {
    videoId: string;
    title: string;
    description: string;
    channelTitle?: string;
  };
  recommendation?: SeoRecommendation;
  error?: string;
};

const defaultChannels = [
  "https://www.youtube.com/@Top5News4",
  "https://www.youtube.com/@TazaHalaat",
].join("\n");

const formatList = (items: string[]) => (items.length ? items.slice(0, 10).join(", ") : "—");

const prettyFrequency = (freq: Record<string, number>) => {
  const entries = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (!entries.length) return "No pattern data yet.";
  return entries.map(([word, count]) => `${word.toUpperCase()} (${count})`).join(", ");
};

export default function Home() {
  const [channelsInput, setChannelsInput] = useState(defaultChannels);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const channels = useMemo(
    () =>
      channelsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [channelsInput]
  );

  const handleAnalyze = async () => {
    if (!channels.length) {
      setError("Add at least one channel to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channels,
          targetVideoUrl: videoUrl.trim() || undefined,
        }),
      });

      const json = (await response.json()) as ApiResponse;
      if (!response.ok || json.error) {
        throw new Error(json.error || "Failed to analyze channels.");
      }
      setData(json);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-20 pt-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">
            YouTube SEO workbench
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Reverse-engineer channel patterns and generate optimized metadata instantly.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Compare title, description, and hashtag strategies from leading channels. Paste your
            video link when ready and let the agent craft SEO-ready output that follows their style.
          </p>
        </header>

        <section className="grid gap-8 rounded-3xl bg-slate-900/60 p-8 shadow-xl shadow-slate-950/50 ring-1 ring-white/10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-3">
              <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                Channel references
              </span>
              <textarea
                value={channelsInput}
                onChange={(event) => setChannelsInput(event.target.value)}
                className="h-44 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                placeholder="One URL or @handle per line"
              />
            </label>
            <label className="flex flex-col gap-3">
              <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                Target video link
              </span>
              <input
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </label>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isLoading ? "Analyzing..." : "Run analysis"}
              <span className="text-lg font-normal transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
            {error ? (
              <p className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-sky-500/20 bg-slate-950/50 p-6 text-sm text-slate-200">
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-white">How it works</p>
              <ol className="space-y-2 text-slate-300">
                <li>1. Paste reference channels (URLs or @handles).</li>
                <li>2. Optional: add a YouTube video link for tailored metadata.</li>
                <li>3. Run analysis to extract patterns and get ready-to-use SEO copy.</li>
              </ol>
            </div>
            <div className="rounded-xl bg-slate-900 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Tips</p>
              <ul className="mt-2 space-y-1">
                <li>• Combine regional and global channels to diversify keywords.</li>
                <li>• Swap video link anytime to refresh the generated SEO output.</li>
                <li>• Export results to your publishing workflow with a quick copy.</li>
              </ul>
            </div>
          </div>
        </section>

        {data ? (
          <section className="flex flex-col gap-10">
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-xl shadow-slate-950/40">
              <h2 className="text-2xl font-semibold text-white">Channel intelligence</h2>
              <p className="mt-1 text-sm text-slate-300">
                Benchmark metadata styles gathered from the reference channels.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {data.channelAnalyses.map((analysis) => (
                  <article
                    key={analysis.channelId}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <a
                          href={analysis.channelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-lg font-semibold text-sky-300 hover:text-sky-200"
                        >
                          {analysis.channelTitle || analysis.channelUrl}
                        </a>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Avg title length · {analysis.averageTitleLength} chars
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 text-xs text-slate-300">
                      <div>
                        <p className="font-semibold text-slate-200">Top keywords</p>
                        <p>{formatList(analysis.topKeywords)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">Common hashtags</p>
                        <p>{formatList(analysis.commonHashtags)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">Opening word trends</p>
                        <p>{prettyFrequency(analysis.firstWordFrequency)}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-slate-400">
                      <p className="font-semibold text-slate-200">Sample headlines</p>
                      <ul className="space-y-1">
                        {analysis.sampleTitles.map((title) => (
                          <li key={title} className="rounded-lg bg-slate-900/70 p-2 text-slate-200">
                            {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <section className="rounded-3xl border border-sky-500/20 bg-slate-900/60 p-8">
                <h3 className="text-xl font-semibold text-white">SEO recommendation</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Crafted to mirror the cadence, length, and keyword focus of your reference set.
                </p>

                {data.recommendation ? (
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Title</p>
                      <p className="mt-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-lg font-semibold text-white">
                        {data.recommendation.recommendedTitle}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Description</p>
                      <pre className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-100">
                        {data.recommendation.recommendedDescription}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hashtags</p>
                      <p className="mt-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-100">
                        {data.recommendation.recommendedHashtags.join(" ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Keyword focus</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data.recommendation.keywordHighlights.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-sm text-slate-300">
                    Add a video link and re-run the analysis to generate tailored metadata.
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8">
                <h3 className="text-xl font-semibold text-white">Pattern snippets</h3>
                <dl className="mt-4 space-y-4 text-sm text-slate-200">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Aggregate keywords
                    </dt>
                    <dd className="mt-1 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                      {formatList(data.aggregateKeywords)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Aggregate hashtags
                    </dt>
                    <dd className="mt-1 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                      {formatList(data.aggregateHashtags)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Opening word leaders
                    </dt>
                    <dd className="mt-1 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                      {formatList(data.aggregateFirstWords)}
                    </dd>
                  </div>
                  {data.targetVideo ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Source video preview
                      </dt>
                      <dd className="mt-1 space-y-2 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                        <p className="text-sm font-semibold text-white">{data.targetVideo.title}</p>
                        <p className="text-xs text-slate-300">
                          Channel: {data.targetVideo.channelTitle ?? "Unknown"}
                        </p>
                        <a
                          href={`https://www.youtube.com/watch?v=${data.targetVideo.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300 hover:text-sky-200"
                        >
                          Open on YouTube →
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
