import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const TYPES = {
  pioneer: {
    name: "Pioneer",
    short: "Visionary / initiator",
    archetype: "Lion",
    colorName: "Red",
    color: "bg-red-100 text-red-900 border-red-300",
    deepStrengths: [
      "Sees future possibilities before others do and is willing to move first.",
      "Brings entrepreneurial courage, fresh thinking, and idea generation to teams.",
      "Can create momentum when a group is stuck in old systems or fear.",
      "Often excels in innovation, launch phases, vision casting, and creative problem solving.",
      "Pushes people to imagine what could be instead of accepting what already is.",
    ],
    deepWatchouts: [
      "Can move so fast that details, process, or people’s pacing get overlooked.",
      "May lose interest once the excitement of starting fades and maintenance begins.",
      "Can sound impatient when others need more certainty before acting.",
      "May underestimate how much structure is needed to turn a dream into a durable system.",
      "Under stress, can chase the next big thing rather than finish the current one.",
    ],
    teamwork:
      "Pioneers work best when they have freedom to create, challenge assumptions, and explore options. They are often complemented by Stabilizers who create order, Analyzers who test the logic, Harmonizers who keep people connected, and Energizers who rally support around the idea.",
    science:
      "Closest overlaps: high Openness in Big Five, some DISC D/I patterns, and innovative or entrepreneurial leadership styles.",
    idealPartners: [
      "Stabilizer for execution",
      "Analyzer for strategy and risk checking",
      "Harmonizer for people impact",
    ],
  },
  harmonizer: {
    name: "Harmonizer",
    short: "Empath / connector",
    archetype: "Dog",
    colorName: "Blue",
    color: "bg-blue-100 text-blue-900 border-blue-300",
    deepStrengths: [
      "Reads emotional tone well and notices when people feel unseen, unsafe, or disconnected.",
      "Builds trust, belonging, and relational safety inside groups and families.",
      "Often acts as a peacemaker who helps conflict become productive instead of destructive.",
      "Brings compassion, empathy, and a people-first lens to leadership decisions.",
      "Can help teams stay human while pursuing performance and goals.",
    ],
    deepWatchouts: [
      "May avoid necessary conflict for too long in order to keep peace.",
      "Can absorb other people’s feelings and become emotionally overloaded.",
      "Sometimes delays hard truth because they do not want to hurt someone.",
      "May prioritize harmony so much that accountability becomes soft or unclear.",
      "Under stress, can withdraw, over-accommodate, or feel responsible for everyone’s emotions.",
    ],
    teamwork:
      "Harmonizers work best in environments with trust, respect, and healthy communication.",
    science:
      "Closest overlaps: high Agreeableness in Big Five and relationship-oriented leadership.",
    idealPartners: [
      "Analyzer for objectivity",
      "Pioneer for bold direction",
      "Stabilizer for consistency",
    ],
  },
  analyzer: {
    name: "Analyzer",
    short: "Strategist / thinker",
    archetype: "Owl",
    colorName: "Purple",
    color: "bg-purple-100 text-purple-900 border-purple-300",
    deepStrengths: [
      "Brings logic, precision, and thoughtful reasoning to decisions.",
      "Finds patterns, inconsistencies, and hidden risks that other people miss.",
      "Excels at research, systems thinking, planning, and breaking down complexity.",
      "Strengthens quality by asking good questions before a team acts too fast.",
      "Helps turn vague ideas into clearer models, plans, and strategies.",
    ],
    deepWatchouts: [
      "Can overanalyze and slow momentum when quick action is needed.",
      "May sound overly skeptical or critical when trying to improve something.",
      "Sometimes trusts data more easily than people’s emotional reality.",
      "May hesitate to act until they feel they have enough certainty.",
      "Under stress, can detach, get stuck in thinking loops, or focus too much on flaws.",
    ],
    teamwork:
      "Analyzers work best when they have clarity, time to think, and access to meaningful information.",
    science:
      "Closest overlaps: analytical problem solving and high conscientious thinking styles.",
    idealPartners: [
      "Energizer for momentum",
      "Harmonizer for relational delivery",
      "Pioneer for fresh ideas",
    ],
  },
  stabilizer: {
    name: "Stabilizer",
    short: "Organizer / finisher",
    archetype: "Bear",
    colorName: "Green",
    color: "bg-green-100 text-green-900 border-green-300",
    deepStrengths: [
      "Creates order, reliability, and trust through consistent follow-through.",
      "Brings systems, routines, and discipline that help teams finish what they start.",
      "Often becomes the backbone of execution because people know they can be counted on.",
      "Helps reduce chaos by clarifying roles, process, expectations, and timelines.",
      "Protects long-term stability when others get distracted by novelty or emotion.",
    ],
    deepWatchouts: [
      "Can resist change when it feels sudden or messy.",
      "May prefer proven methods so much that innovation gets slowed down.",
      "Sometimes becomes rigid when stress rises.",
      "Can carry too much responsibility rather than delegating.",
      "Under pressure, may focus on control instead of adaptability.",
    ],
    teamwork:
      "Stabilizers work best when there are clear expectations and dependable systems.",
    science:
      "Closest overlaps: high Conscientiousness and dependable execution styles.",
    idealPartners: [
      "Pioneer for innovation",
      "Energizer for morale",
      "Harmonizer for connection",
    ],
  },
  energizer: {
    name: "Energizer",
    short: "Motivator / catalyst",
    archetype: "Dolphin",
    colorName: "Yellow",
    color: "bg-yellow-100 text-yellow-900 border-yellow-300",
    deepStrengths: [
      "Creates enthusiasm, visibility, and momentum in people and projects.",
      "Often inspires others to act when motivation is low.",
      "Brings warmth, encouragement, and persuasive communication.",
      "Can rally attention around a mission.",
      "Thrives in dynamic spaces where motivation matters.",
    ],
    deepWatchouts: [
      "Can overcommit or move too fast.",
      "May struggle with repetitive tasks.",
      "Sometimes prioritizes energy without checking the plan.",
      "Can become scattered with too many opportunities.",
      "Under stress may seek stimulation or distraction.",
    ],
    teamwork:
      "Energizers work best when they can communicate, encourage, and build momentum.",
    science:
      "Closest overlaps: high Extraversion and influence-based leadership.",
    idealPartners: [
      "Analyzer for focus",
      "Stabilizer for structure",
      "Pioneer for vision",
    ],
  },
};

const youthQuestions = [
  { id: 1, type: "pioneer", text: "I enjoy starting new ideas more than following the same old way." },
  { id: 2, type: "harmonizer", text: "I usually notice when someone feels left out." },
  { id: 3, type: "analyzer", text: "I like to think things through before deciding." },
  { id: 4, type: "stabilizer", text: "I like clear plans and knowing what to expect." },
  { id: 5, type: "energizer", text: "I bring energy to a group." },
  { id: 6, type: "pioneer", text: "I get excited about new possibilities." },
  { id: 7, type: "harmonizer", text: "I care a lot about my friendships." },
  { id: 8, type: "analyzer", text: "I like solving problems step by step." },
  { id: 9, type: "stabilizer", text: "People can count on me to finish what I start." },
  { id: 10, type: "energizer", text: "I like cheering people on when they feel down." },
  { id: 11, type: "pioneer", text: "I am willing to try something new even if it feels risky." },
  { id: 12, type: "harmonizer", text: "I often try to help people get along." },
  { id: 13, type: "analyzer", text: "I ask questions to understand things better." },
  { id: 14, type: "stabilizer", text: "I like to finish one task before starting another." },
  { id: 15, type: "energizer", text: "I enjoy talking in front of groups." },
  { id: 16, type: "pioneer", text: "I would rather create something new than copy what already exists." },
  { id: 17, type: "harmonizer", text: "I think about how my choices affect other people." },
  { id: 18, type: "analyzer", text: "I trust facts and evidence when making choices." },
  { id: 19, type: "stabilizer", text: "I help groups stay organized." },
  { id: 20, type: "energizer", text: "I like getting people excited about a goal." },
  { id: 21, type: "pioneer", text: "I like challenging old ways when I think there is a better one." },
  { id: 22, type: "harmonizer", text: "People often come to me when they need support." },
  { id: 23, type: "analyzer", text: "I compare different choices before I decide." },
  { id: 24, type: "stabilizer", text: "I do better when rules and expectations are clear." },
  { id: 25, type: "energizer", text: "My excitement often helps others take action." },
];

const adultQuestions = [
  { id: 1, type: "pioneer", text: "I enjoy initiating new ideas more than maintaining legacy systems." },
  { id: 2, type: "harmonizer", text: "I quickly notice relational tension or exclusion in a group." },
  { id: 3, type: "analyzer", text: "I prefer studying the facts before making a decision." },
  { id: 4, type: "stabilizer", text: "I prefer clear plans, structure, and predictable execution." },
  { id: 5, type: "energizer", text: "I naturally create energy and momentum in a room." },
  { id: 6, type: "pioneer", text: "I am energized by possibilities that others have not yet considered." },
  { id: 7, type: "harmonizer", text: "I care deeply about preserving trust and healthy relationships." },
  { id: 8, type: "analyzer", text: "I enjoy solving complex problems step by step." },
  { id: 9, type: "stabilizer", text: "People know they can rely on me for follow-through." },
  { id: 10, type: "energizer", text: "I like encouraging people when morale is slipping." },
  { id: 11, type: "pioneer", text: "I am comfortable taking calculated risks if the goal is worthwhile." },
  { id: 12, type: "harmonizer", text: "I often help reduce tension and restore connection between people." },
  { id: 13, type: "analyzer", text: "I ask questions until I understand the deeper logic of a situation." },
  { id: 14, type: "stabilizer", text: "I prefer completing key priorities before opening new ones." },
  { id: 15, type: "energizer", text: "I am comfortable speaking in front of teams or groups." },
  { id: 16, type: "pioneer", text: "I would rather build a new model than only improve an old one." },
  { id: 17, type: "harmonizer", text: "I think carefully about how choices affect people emotionally." },
  { id: 18, type: "analyzer", text: "I trust logic and evidence more than impulse." },
  { id: 19, type: "stabilizer", text: "I help teams stay organized, accountable, and on track." },
  { id: 20, type: "energizer", text: "I enjoy rallying people around a mission or goal." },
  { id: 21, type: "pioneer", text: "I challenge the status quo when I believe a better path exists." },
  { id: 22, type: "harmonizer", text: "People often come to me when they need support or perspective." },
  { id: 23, type: "analyzer", text: "I like comparing several options before choosing one." },
  { id: 24, type: "stabilizer", text: "I perform best when expectations are explicit and roles are clear." },
  { id: 25, type: "energizer", text: "My enthusiasm often helps others move into action." },
  { id: 26, type: "pioneer", text: "I think more about what could be than what already is." },
  { id: 27, type: "harmonizer", text: "I value cooperation more than competition." },
  { id: 28, type: "analyzer", text: "I like breaking large problems into smaller parts." },
  { id: 29, type: "stabilizer", text: "I prefer dependable systems over frequent change." },
  { id: 30, type: "energizer", text: "I enjoy celebrating progress and wins with a team." },
  { id: 31, type: "pioneer", text: "I quickly spot opportunity inside challenge or uncertainty." },
  { id: 32, type: "harmonizer", text: "I work hard to make people feel seen, safe, and valued." },
  { id: 33, type: "analyzer", text: "I feel satisfied when ideas and systems make logical sense." },
  { id: 34, type: "stabilizer", text: "I take pride in being steady, reliable, and dependable." },
  { id: 35, type: "energizer", text: "I often help others stay hopeful during hard seasons." },
  { id: 36, type: "pioneer", text: "I get restless when there is no room for creativity or innovation." },
  { id: 37, type: "harmonizer", text: "I usually try to understand both sides of a conflict." },
  { id: 38, type: "analyzer", text: "I enjoy research, evaluation, and careful thinking." },
  { id: 39, type: "stabilizer", text: "I like systems that keep work orderly and repeatable." },
  { id: 40, type: "energizer", text: "I am often the one who gets people moving." },
  { id: 41, type: "pioneer", text: "I am drawn to bold ideas and future possibilities." },
  { id: 42, type: "harmonizer", text: "I feel responsible for the emotional climate of a group." },
  { id: 43, type: "analyzer", text: "I catch inconsistencies that others often miss." },
  { id: 44, type: "stabilizer", text: "I stay committed even when the work becomes repetitive." },
  { id: 45, type: "energizer", text: "I like using encouragement to build momentum." },
  { id: 46, type: "pioneer", text: "I prefer freedom to explore over rigid rules." },
  { id: 47, type: "harmonizer", text: "I want people around me to feel respected and emotionally safe." },
  { id: 48, type: "analyzer", text: "I tend to think carefully before I speak or act." },
  { id: 49, type: "stabilizer", text: "I create order when situations feel chaotic." },
  { id: 50, type: "energizer", text: "I feel energized when I can inspire other people." },
];

const QUESTION_SETS = {
  youth: {
    key: "youth",
    label: "Student / Youth Version",
    description: "Simpler wording for students, teens, youth programs, and school leadership groups.",
    questions: youthQuestions,
  },
  adult: {
    key: "adult",
    label: "Adult Leadership Version",
    description: "Leadership-centered wording for adults, teams, workplaces, and coaching settings.",
    questions: adultQuestions,
  },
};

function normalizeScores(rawScores, activeQuestions) {
  const counts = activeQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(rawScores)
    .map(([key, value]) => ({
      key,
      score: value,
      percent: counts[key] ? Math.round((value / (counts[key] * 5)) * 100) : 0,
      ...TYPES[key],
    }))
    .sort((a, b) => b.score - a.score);
}

function getBlendSummary(primary, secondary) {
  if (!primary || !secondary) return "";
  const map = {
    "Pioneer-Harmonizer": "You are a visionary connector. You dream big, initiate possibilities, and still care deeply about how those ideas affect people.",
    "Pioneer-Analyzer": "You are a strategic innovator. You enjoy bold ideas, but you also want those ideas to make sense and hold up under pressure.",
    "Pioneer-Stabilizer": "You are a builder. You can imagine a better future while still respecting what it takes to make things real and sustainable.",
    "Pioneer-Energizer": "You are a catalyst. You bring vision, boldness, and visible momentum that can energize an entire room.",
    "Harmonizer-Analyzer": "You are a thoughtful empath. You balance emotional intelligence with careful reasoning and often help groups make wise people-centered decisions.",
    "Harmonizer-Stabilizer": "You are a dependable encourager. You create environments that feel safe, steady, respectful, and trustworthy.",
    "Harmonizer-Energizer": "You are a warm motivator. You naturally lift others up and help people feel included, energized, and emotionally connected.",
    "Analyzer-Stabilizer": "You are a careful planner. You value precision, reliability, and systems that help ideas become dependable results.",
    "Analyzer-Energizer": "You are a persuasive thinker. You can take complex ideas and give them direction, clarity, and visible momentum.",
    "Stabilizer-Energizer": "You are a practical motivator. You help teams move forward while protecting structure, accountability, and follow-through.",
  };
  const a = `${primary.name}-${secondary.name}`;
  const b = `${secondary.name}-${primary.name}`;
  return (
    map[a] ||
    map[b] ||
    `You blend ${primary.name} and ${secondary.name}, which means you bring both ${primary.short.toLowerCase()} and ${secondary.short.toLowerCase()} energy to the people around you.`
  );
}

function getComplimentMessage(primary, results) {
  if (!primary) return "";
  const lowerTypes = results.slice(3).map((r) => r.name);
  return `Your lower-scoring types are not weaknesses to be ashamed of. They usually show where you may naturally need support, partnership, or intentional growth. ${primary.name}s often benefit from people who bring ${lowerTypes.join(" and ")} energy so the whole team becomes stronger and more balanced.`;
}

function getVisibleResults(answers) {
  return Object.keys(answers).length >= 20;
}

function validateQuestionSet(name, questionSet) {
  const validTypes = new Set(Object.keys(TYPES));
  const ids = new Set();
  const errors = [];

  questionSet.forEach((question) => {
    if (ids.has(question.id)) {
      errors.push(`${name}: duplicate id ${question.id}`);
    }
    ids.add(question.id);

    if (!validTypes.has(question.type)) {
      errors.push(`${name}: invalid type ${question.type}`);
    }

    if (!question.text || typeof question.text !== "string") {
      errors.push(`${name}: missing text for id ${question.id}`);
    }
  });

  return errors;
}

const questionSetDiagnostics = [
  ...validateQuestionSet("youth", youthQuestions),
  ...validateQuestionSet("adult", adultQuestions),
];

export default function PhasePersonalityTestApp() {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const activeSet = selectedVersion ? QUESTION_SETS[selectedVersion] : null;
  const activeQuestions = activeSet?.questions || [];

  const answeredCount = Object.keys(answers).length;
  const progress = activeQuestions.length ? Math.round((answeredCount / activeQuestions.length) * 100) : 0;
  const canPreviewResults = getVisibleResults(answers);
  const allAnswered = activeQuestions.length > 0 && answeredCount === activeQuestions.length;

  const results = useMemo(() => {
    const raw = { pioneer: 0, harmonizer: 0, analyzer: 0, stabilizer: 0, energizer: 0 };
    activeQuestions.forEach((q) => {
      raw[q.type] += Number(answers[q.id] || 0);
    });
    return normalizeScores(raw, activeQuestions);
  }, [answers, activeQuestions]);

  const primary = results[0];
  const secondary = results[1];

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const resetTest = () => {
    setAnswers({});
    setShowResults(false);
    setStarted(false);
    setSelectedVersion(null);
  };

  const chooseVersion = (key) => {
    setSelectedVersion(key);
    setAnswers({});
    setShowResults(false);
    setStarted(true);
  };

  const handleChangeVersion = () => {
    setStarted(false);
    setSelectedVersion(null);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full px-3 py-1 text-sm">PHASE Mindset™</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  Adaptive Results Preview
                </Badge>
              </div>
              <CardTitle className="text-3xl md:text-4xl">PHASE Personalities™ Assessment</CardTitle>
              <CardDescription className="max-w-4xl text-base leading-7 md:text-lg">
                First choose a version: Student / Youth or Adult Leadership. Then answer the questions to discover
                your top personality blend across Pioneer, Harmonizer, Analyzer, Stabilizer, and Energizer. After 20
                answers, you can preview your results or keep going to sharpen the profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              {Object.values(TYPES).map((t) => (
                <div key={t.name} className={`rounded-2xl border p-4 ${t.color}`}>
                  <div className="text-lg font-semibold">{t.name}</div>
                  <div className="text-sm opacity-80">{t.short}</div>
                  <div className="mt-2 text-sm font-medium">
                    {t.colorName} • {t.archetype}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {questionSetDiagnostics.length > 0 && (
          <Card className="rounded-3xl border border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-5">
              <div className="font-semibold text-red-800">Question set validation warnings</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {questionSetDiagnostics.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {!started && (
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <h2 className="text-2xl font-semibold">Choose your assessment version</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Start by picking the version that fits the person taking the test. The youth version uses simpler,
                  student-friendly wording. The adult version uses leadership and team language for workplaces,
                  coaching, and adult development.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.values(QUESTION_SETS).map((set) => (
                  <button
                    key={set.key}
                    onClick={() => chooseVersion(set.key)}
                    className="rounded-3xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-xl font-semibold">{set.label}</div>
                    <p className="mt-2 leading-7 text-slate-600">{set.description}</p>
                    <div className="mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-medium">
                      Start {set.label}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-medium">Scale</div>
                  <div className="mt-2 text-sm text-slate-600">1 = Strongly Disagree, 5 = Strongly Agree</div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-medium">Early preview</div>
                  <div className="mt-2 text-sm text-slate-600">
                    Results unlock after 20 questions so users can see an early read and keep refining it.
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="font-medium">Archetypes</div>
                  <div className="mt-2 text-sm text-slate-600">
                    Each type includes a color, animal archetype, strengths, watchouts, team-fit, and science-based
                    parallels.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {started && !showResults && (
          <>
            <Card className="sticky top-4 z-10 rounded-3xl border-0 shadow-sm">
              <CardContent className="space-y-3 p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">Progress</div>
                    <div className="text-sm text-slate-600">
                      {answeredCount} of {activeQuestions.length} answered
                    </div>
                    {activeSet && (
                      <div className="mt-1 text-sm text-slate-500">Current version: {activeSet.label}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => setShowResults(true)}
                      disabled={!canPreviewResults}
                    >
                      {canPreviewResults ? "Preview Results" : "Unlock at 20 Questions"}
                    </Button>
                    <Button variant="ghost" className="rounded-2xl" onClick={handleChangeVersion}>
                      Change Version
                    </Button>
                  </div>
                </div>
                <Progress value={progress} />
                <div className="text-sm text-slate-600">
                  {canPreviewResults
                    ? "You can preview your results now, or keep answering to sharpen the profile."
                    : `Answer ${20 - answeredCount} more question${20 - answeredCount === 1 ? "" : "s"} to unlock results.`}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {activeQuestions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.01 }}
                >
                  <Card className="rounded-3xl border-0 shadow-sm">
                    <CardContent className="space-y-4 p-5 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-500">Question {idx + 1}</div>
                          <div className="mt-1 text-lg font-medium leading-7">{q.text}</div>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {TYPES[q.type].name}
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-5">
                        {SCALE.map((s) => {
                          const active = Number(answers[q.id]) === s.value;
                          return (
                            <button
                              key={s.value}
                              onClick={() => handleAnswer(q.id, s.value)}
                              className={`rounded-2xl border px-3 py-3 text-sm transition ${
                                active ? "border-slate-900 bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
                              }`}
                            >
                              <div className="font-semibold">{s.value}</div>
                              <div>{s.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {showResults && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-3xl">Your PHASE Results</CardTitle>
                <CardDescription className="text-base">
                  {allAnswered
                    ? "These are your strongest current tendencies based on the full set of answers for the version you selected."
                    : `This is a live preview based on ${answeredCount} answers. Keep going to sharpen the result.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-3xl border p-5 ${primary?.color || "bg-slate-100"}`}>
                    <div className="text-sm font-medium uppercase tracking-wide">Primary Personality</div>
                    <div className="mt-2 text-3xl font-bold">{primary?.name}</div>
                    <div className="mt-1 text-base">{primary?.short}</div>
                    <div className="mt-2 text-sm font-medium">
                      {primary?.colorName} • {primary?.archetype}
                    </div>
                    <div className="mt-3 text-sm">
                      Score: {primary?.score} / {activeQuestions.filter((q) => q.type === primary?.key).length * 5} ({primary?.percent}%)
                    </div>
                  </div>
                  <div className={`rounded-3xl border p-5 ${secondary?.color || "bg-slate-100"}`}>
                    <div className="text-sm font-medium uppercase tracking-wide">Secondary Personality</div>
                    <div className="mt-2 text-3xl font-bold">{secondary?.name}</div>
                    <div className="mt-1 text-base">{secondary?.short}</div>
                    <div className="mt-2 text-sm font-medium">
                      {secondary?.colorName} • {secondary?.archetype}
                    </div>
                    <div className="mt-3 text-sm">
                      Score: {secondary?.score} / {activeQuestions.filter((q) => q.type === secondary?.key).length * 5} ({secondary?.percent}%)
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-5">
                  <div className="text-xl font-semibold">Your blend</div>
                  <p className="mt-2 leading-7 text-slate-700">{getBlendSummary(primary, secondary)}</p>
                  <p className="mt-3 leading-7 text-slate-600">{getComplimentMessage(primary, results)}</p>
                </div>

                <Tabs defaultValue="scoreboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                    <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
                    <TabsTrigger value="strengths">Deep strengths</TabsTrigger>
                    <TabsTrigger value="teamwork">How to work with me</TabsTrigger>
                    <TabsTrigger value="science">Science parallels</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scoreboard" className="mt-4">
                    <div className="grid gap-4">
                      {results.map((r, index) => (
                        <div key={r.key} className="rounded-2xl border bg-white p-4">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <div>
                              <div className="font-semibold">
                                #{index + 1} {r.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {r.short} • {r.colorName} • {r.archetype}
                              </div>
                            </div>
                            <div className="text-sm font-medium">{r.percent}%</div>
                          </div>
                          <Progress value={r.percent} />
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {index < 2
                              ? `${r.name} is one of your strongest energies right now.`
                              : `${r.name} is lower in your current profile, which may mean this is an area where you benefit from teammates, mentoring, or intentional growth.`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="strengths" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[primary, secondary].filter(Boolean).map((r) => (
                        <Card key={r.key} className="rounded-3xl border-0 shadow-sm">
                          <CardHeader>
                            <CardTitle>{r.name}</CardTitle>
                            <CardDescription>
                              {r.short} • {r.colorName} • {r.archetype}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <div>
                              <div className="font-medium">Deep strengths</div>
                              <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                                {r.deepStrengths.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="font-medium">Watchouts</div>
                              <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                                {r.deepWatchouts.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="teamwork" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[primary, secondary].filter(Boolean).map((r) => (
                        <div key={r.key} className="rounded-3xl border bg-white p-5">
                          <div className="text-xl font-semibold">{r.name}</div>
                          <p className="mt-2 leading-7 text-slate-700">{r.teamwork}</p>
                          <div className="mt-4 font-medium">Often complemented by</div>
                          <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                            {r.idealPartners.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="science" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {results.map((r) => (
                        <div key={r.key} className="rounded-3xl border bg-white p-5">
                          <div className="text-xl font-semibold">{r.name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {r.colorName} • {r.archetype}
                          </div>
                          <p className="mt-3 leading-7 text-slate-700">{r.science}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-3">
                  {!allAnswered && (
                    <Button className="rounded-2xl" onClick={() => setShowResults(false)}>
                      Keep Honing Results
                    </Button>
                  )}
                  {allAnswered && (
                    <Button className="rounded-2xl" onClick={() => setShowResults(false)}>
                      Back to Questions
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-2xl" onClick={resetTest}>
                    Reset Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
