"use client";

import {
  BarChart3,
  Bookmark,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Gauge,
  Heart,
  ListChecks,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat2,
  RotateCcw,
  Search,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Volume2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  buildContentDraft,
  type ContentDraft,
  type PipelineRecipe,
  type ReelScene,
} from "@/lib/content-pipeline/reel-draft";
import { renderReelToBlob } from "@/lib/content-pipeline/browser-reel-renderer";
import type {
  ContentPipelineAutomationRuleSummary,
  ContentPipelineScheduledPostSummary,
} from "@/lib/content-pipeline/scheduling";
import type { SocialSetupStatus } from "@/lib/content-pipeline/social-setup";
import { uploadMediaAsset } from "@/lib/upload-media-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PlatformKey =
  | "instagram_reel"
  | "facebook_reel"
  | "instagram_photo"
  | "facebook_post"
  | "pinterest_pin"
  | "youtube_short"
  | "x_post"
  | "linkedin_post";

type PublishResult = {
  platform: string;
  status: "published" | "dry_run" | "setup_required" | "blocked" | "failed";
  message: string;
  id?: string;
  url?: string;
};

type RecipeSearchResponse = {
  recipes?: PipelineRecipe[];
};

type ScheduleStateResponse = {
  scheduledPosts?: ContentPipelineScheduledPostSummary[];
  automationRules?: ContentPipelineAutomationRuleSummary[];
};

type PinterestBoardSummary = {
  id: string;
  name: string;
  privacy?: string | null;
};

type PinterestBoardsResponse = {
  board?: PinterestBoardSummary;
  boards?: PinterestBoardSummary[];
  selectedBoardId?: string | null;
};

type EditableContent = {
  instagramCaption: string;
  facebookPost: string;
  pinterestTitle: string;
  pinterestDescription: string;
  youtubeTitle: string;
  youtubeDescription: string;
  voiceoverSpeech: string;
  xPost: string;
  linkedinPost: string;
  backgroundVideoUrl: string;
  reelVideoUrl: string;
  voiceoverAudioUrl: string;
  showReelTextOverlay: boolean;
  scenes: ReelScene[];
};

type ApprovalMap = Record<string, true>;
type ContentOverrideMap = Record<string, Partial<EditableContent>>;
type LocalAssetMap = Record<
  string,
  {
    videoFile?: File;
    videoUrl?: string;
    videoName?: string;
    voiceFile?: File;
    voiceUrl?: string;
    voiceName?: string;
  }
>;

type ScheduleSelectionMap = Partial<Record<PlatformKey, boolean>>;

type AutomationFormState = {
  name: string;
  platforms: ScheduleSelectionMap;
  timeSlots: string[];
  timeSlotDraft: string;
  daysOfWeek: number[];
};

const APPROVAL_STORAGE_KEY = "kyakhayen-content-pipeline-platform-approvals-v2";
const CONTENT_STORAGE_KEY = "kyakhayen-content-pipeline-content-overrides-v3";
const CONTENT_COPY_VERSION = "social-copy-v3";
const PREVIEW_FRAMES = [
  { objectPosition: "50% 50%", transform: "scale(1.08)" },
  { objectPosition: "35% 50%", transform: "scale(1.2) translateX(2%)" },
  { objectPosition: "65% 48%", transform: "scale(1.18) translateX(-2%)" },
  { objectPosition: "50% 72%", transform: "scale(1.26) translateY(-2%)" },
  { objectPosition: "45% 42%", transform: "scale(1.22) translateY(2%)" },
  { objectPosition: "50% 50%", transform: "scale(1.12)" },
];

const PLATFORMS: Array<{
  key: PlatformKey;
  label: string;
  description: string;
}> = [
  {
    key: "instagram_reel",
    label: "Instagram Reel",
    description: "Caption + reel script. Publishing needs a rendered MP4 URL.",
  },
  {
    key: "facebook_reel",
    label: "Facebook Reel",
    description: "Reel caption + rendered MP4 for Facebook Page.",
  },
  {
    key: "instagram_photo",
    label: "Instagram Photo",
    description: "Image post with Instagram caption.",
  },
  {
    key: "facebook_post",
    label: "Facebook Post",
    description: "Link post with complete caption and hashtags.",
  },
  {
    key: "pinterest_pin",
    label: "Pinterest Pin",
    description: "Pin title, description, image, and recipe link.",
  },
  {
    key: "youtube_short",
    label: "YouTube Short",
    description: "Short title, description, and voiceover script.",
  },
  {
    key: "x_post",
    label: "X Post",
    description: "Short post with recipe link and compact hashtags.",
  },
  {
    key: "linkedin_post",
    label: "LinkedIn Post",
    description: "Professional recipe update with link and hashtags.",
  },
];

const SIMPLE_POST_PLATFORMS: PlatformKey[] = [
  "instagram_photo",
  "facebook_post",
  "pinterest_pin",
  "x_post",
  "linkedin_post",
];
const VIDEO_POST_PLATFORMS: PlatformKey[] = [
  "instagram_reel",
  "facebook_reel",
  "youtube_short",
];
const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];
const QUICK_TIME_SLOTS = ["07:30", "09:00", "12:30", "15:30", "18:00", "20:30"];
const defaultAutomationPlatforms: ScheduleSelectionMap = {
  instagram_photo: true,
  facebook_post: true,
  pinterest_pin: true,
};

function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeJsonStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function mergeRecipeQueues(primary: PipelineRecipe[], secondary: PipelineRecipe[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((recipe) => {
    if (seen.has(recipe.id)) return false;
    seen.add(recipe.id);
    return true;
  });
}

function approvalKey(draftId: string, platform: PlatformKey) {
  return `${draftId}:${platform}`;
}

function contentKey(draftId: string) {
  return `${draftId}:${CONTENT_COPY_VERSION}`;
}

function defaultEditableContent(draft: ContentDraft): EditableContent {
  return {
    instagramCaption: draft.instagramCaption,
    facebookPost: draft.facebookPost,
    pinterestTitle: draft.pinterestTitle,
    pinterestDescription: draft.pinterestDescription,
    youtubeTitle: draft.youtubeTitle,
    youtubeDescription: draft.youtubeDescription,
    voiceoverSpeech: draft.voiceoverSpeech,
    xPost: draft.xPost,
    linkedinPost: draft.linkedinPost,
    backgroundVideoUrl: "",
    reelVideoUrl: "",
    voiceoverAudioUrl: "",
    showReelTextOverlay: true,
    scenes: draft.scenes,
  };
}

function normalizeSpeechInput(input: string) {
  return input
    .replace(/\bKya\s+Khayen\b/gi, "क्या खाएं")
    .replace(/\bKyakhayen\b/gi, "क्या खाएं");
}

async function copyText(value: string, label: string) {
  await navigator.clipboard.writeText(value);
  toast.success(`${label} copied.`);
}

function downloadBlob(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

function safeFileName(value: string, fallback = "reel") {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || fallback
  );
}

async function downloadRemoteUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to download the rendered reel.");
    const blobUrl = URL.createObjectURL(await response.blob());
    downloadBlob(blobUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  }
}

function chooseSpeechVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => /lekha|heera|swara|kalpana/i.test(voice.name)) ??
    voices.find((voice) => /google.*(hindi|हिन्दी)/i.test(voice.name)) ??
    voices.find((voice) => /hindi|हिन्दी/i.test(voice.name)) ??
    voices.find((voice) => /hemant/i.test(voice.name)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("hi")) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-in")) ??
    voices.find((voice) => /india|indian/i.test(voice.name)) ??
    null
  );
}

function platformCopy(content: EditableContent, platform: PlatformKey) {
  if (platform === "facebook_post") return content.facebookPost;
  if (platform === "pinterest_pin") {
    return `${content.pinterestTitle}\n\n${content.pinterestDescription}`;
  }
  if (platform === "youtube_short") {
    return `${content.youtubeTitle}\n\n${content.youtubeDescription}`;
  }
  if (platform === "x_post") return content.xPost;
  if (platform === "linkedin_post") return content.linkedinPost;
  return content.instagramCaption;
}

function compactPreviewCopy(value: string, max = 190) {
  const clean = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function platformPublishPayload(
  draft: ContentDraft,
  content: EditableContent,
  platforms: PlatformKey[]
) {
  return {
    recipeId: draft.recipeId,
    recipeTitle: draft.recipeTitle,
    recipeUrl: draft.recipeUrl,
    imageUrl: draft.imageUrl,
    videoUrl: content.reelVideoUrl || undefined,
    instagramCaption: content.instagramCaption,
    facebookPost: content.facebookPost,
    pinterestTitle: content.pinterestTitle,
    pinterestDescription: content.pinterestDescription,
    youtubeTitle: content.youtubeTitle,
    youtubeDescription: content.youtubeDescription,
    xPost: content.xPost,
    linkedinPost: content.linkedinPost,
    platforms,
  };
}

function platformResultLabel(platform: string) {
  return PLATFORMS.find((item) => item.key === platform)?.label ?? platform.replaceAll("_", " ");
}

function platformLabel(platform: PlatformKey | string) {
  return PLATFORMS.find((item) => item.key === platform)?.label ?? platform.replaceAll("_", " ");
}

function localDatetimeInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function defaultScheduleAtInput() {
  const next = new Date(Date.now() + 60 * 60 * 1000);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
  return localDatetimeInputValue(next);
}

function formatScheduleDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function statusLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function selectedPlatforms(selection: ScheduleSelectionMap, allowedPlatforms: PlatformKey[]) {
  return allowedPlatforms.filter((platform) => selection[platform]);
}

function normalizeTimeSlot(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "";
}

function sortUniqueTimeSlots(values: string[]) {
  return Array.from(new Set(values.map(normalizeTimeSlot).filter(Boolean))).sort();
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function isAttemptSuccess(status: string) {
  return status === "published" || status === "dry_run";
}

function engagementTotal(post: ContentPipelineScheduledPostSummary) {
  return post.publishAttempts.reduce(
    (total, attempt) =>
      total +
      (attempt.reactionCount ?? 0) +
      (attempt.commentCount ?? 0) +
      (attempt.shareCount ?? 0),
    0
  );
}

async function readResponsePayload<T>(response: Response, fallback: string) {
  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T | string;
  } catch {
    return fallback;
  }
}

function responseMessage(payload: unknown, fallback: string) {
  return typeof payload === "string" && payload.trim() ? payload : fallback;
}

function previewTextSize(text: string) {
  if (text.length > 72) return "text-2xl";
  if (text.length > 44) return "text-3xl";
  return "text-4xl";
}

function sceneStartSecond(seconds: string, fallbackIndex: number) {
  const start = Number(seconds.split("-")[0]);
  return Number.isFinite(start) ? start : fallbackIndex * 4;
}

function PreviewImage({
  draft,
  className,
  imageClassName,
  sizes = "360px",
}: {
  draft: ContentDraft;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-full overflow-hidden bg-muted", className)}>
      {draft.imageUrl ? (
        <Image
          src={draft.imageUrl}
          alt={draft.recipeTitle}
          fill
          unoptimized
          sizes={sizes}
          className={cn("size-full object-cover object-center", imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4c2d1b] to-[#111827]" />
      )}
    </div>
  );
}

export function ContentPipelineDashboard({
  recipes,
  initialSocialSetup,
  initialScheduledPosts,
  initialAutomationRules,
}: {
  recipes: PipelineRecipe[];
  initialSocialSetup: SocialSetupStatus;
  initialScheduledPosts: ContentPipelineScheduledPostSummary[];
  initialAutomationRules: ContentPipelineAutomationRuleSummary[];
}) {
  const [recipeQueue, setRecipeQueue] = useState<PipelineRecipe[]>(recipes);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeSearching, setRecipeSearching] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? "");
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("facebook_post");
  const [approvals, setApprovals] = useState<ApprovalMap>({});
  const [contentOverrides, setContentOverrides] = useState<ContentOverrideMap>({});
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [renderingReel, setRenderingReel] = useState(false);
  const [reelRenderProgress, setReelRenderProgress] = useState("");
  const [reelRenderPercent, setReelRenderPercent] = useState(0);
  const [renderProgressOpen, setRenderProgressOpen] = useState(false);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
  const [voiceGenerating, setVoiceGenerating] = useState(false);
  const [socialSetup, setSocialSetup] = useState(initialSocialSetup);
  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoardSummary[]>([]);
  const [pinterestBoardLoading, setPinterestBoardLoading] = useState(false);
  const [pinterestBoardsChecked, setPinterestBoardsChecked] = useState(false);
  const [pinterestBoardCreating, setPinterestBoardCreating] = useState(false);
  const [pinterestBoardSaving, setPinterestBoardSaving] = useState(false);
  const [selectedPinterestBoardId, setSelectedPinterestBoardId] = useState(
    () =>
      initialSocialSetup.platforms.find((platform) => platform.key === "pinterest")
        ?.selectedBoardId ?? ""
  );
  const [localAssets, setLocalAssets] = useState<LocalAssetMap>({});
  const [scheduledPosts, setScheduledPosts] =
    useState<ContentPipelineScheduledPostSummary[]>(initialScheduledPosts);
  const [automationRules, setAutomationRules] =
    useState<ContentPipelineAutomationRuleSummary[]>(initialAutomationRules);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState(defaultScheduleAtInput);
  const [scheduleSelection, setScheduleSelection] = useState<ScheduleSelectionMap>({});
  const [schedulingPost, setSchedulingPost] = useState(false);
  const [automationForm, setAutomationForm] = useState<AutomationFormState>({
    name: "Daily recipe social posts",
    platforms: defaultAutomationPlatforms,
    timeSlots: ["09:00", "18:00"],
    timeSlotDraft: "12:30",
    daysOfWeek: [],
  });
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [automationSaving, setAutomationSaving] = useState(false);
  const [automationBusyId, setAutomationBusyId] = useState<string | null>(null);
  const localAssetsRef = useRef<LocalAssetMap>({});
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voicePreviewTimersRef = useRef<number[]>([]);
  const handledPinterestReturnRef = useRef(false);

  const drafts = useMemo(() => recipeQueue.map(buildContentDraft), [recipeQueue]);
  const selectedDraft =
    drafts.find((draft) => draft.recipeId === selectedRecipeId) ?? drafts[0] ?? null;
  const selectedContent = useMemo(() => {
    if (!selectedDraft) return null;
    return {
      ...defaultEditableContent(selectedDraft),
      ...(contentOverrides[contentKey(selectedDraft.id)] ?? {}),
    };
  }, [contentOverrides, selectedDraft]);
  const activeScenes = selectedContent?.scenes ?? selectedDraft?.scenes ?? [];
  const activeScene = activeScenes[previewSceneIndex] ?? activeScenes[0] ?? null;
  const activeFrame = PREVIEW_FRAMES[previewSceneIndex % PREVIEW_FRAMES.length];
  const selectedLocalAssets = selectedDraft ? localAssets[selectedDraft.id] : undefined;
  const backgroundVideoPreviewUrl =
    selectedLocalAssets?.videoUrl || selectedContent?.backgroundVideoUrl || "";
  const renderedReelUrl = selectedContent?.reelVideoUrl || "";
  const voiceoverAudioPreviewUrl =
    selectedLocalAssets?.voiceUrl || selectedContent?.voiceoverAudioUrl || "";

  const currentApprovalKey = selectedDraft
    ? approvalKey(selectedDraft.id, activePlatform)
    : "";
  const currentApproved = Boolean(currentApprovalKey && approvals[currentApprovalKey]);
  const approvedPlatformCount = selectedDraft
    ? PLATFORMS.filter((platform) => approvals[approvalKey(selectedDraft.id, platform.key)]).length
    : 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setApprovals(readJsonStorage<ApprovalMap>(APPROVAL_STORAGE_KEY, {}));
      setContentOverrides(readJsonStorage<ContentOverrideMap>(CONTENT_STORAGE_KEY, {}));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        voicePreviewTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      }
      voiceAudioRef.current?.pause();
      Object.values(localAssetsRef.current).forEach((assets) => {
        if (assets.videoUrl) URL.revokeObjectURL(assets.videoUrl);
        if (assets.voiceUrl) URL.revokeObjectURL(assets.voiceUrl);
      });
    };
  }, []);

  const resetRenderState = () => {
    setReelRenderProgress("");
    setReelRenderPercent(0);
    setRenderProgressOpen(false);
  };

  const updateSelectedContent = <Field extends keyof EditableContent>(
    field: Field,
    value: EditableContent[Field],
    options?: { invalidateReel?: boolean }
  ) => {
    if (!selectedDraft) return;

    const key = contentKey(selectedDraft.id);
    const shouldInvalidateReel = Boolean(options?.invalidateReel && field !== "reelVideoUrl");
    const next = {
      ...contentOverrides,
      [key]: {
        ...(contentOverrides[key] ?? {}),
        [field]: value,
        ...(shouldInvalidateReel ? { reelVideoUrl: "" } : {}),
      },
    };
    setContentOverrides(next);
    writeJsonStorage(CONTENT_STORAGE_KEY, next);
    if (shouldInvalidateReel) resetRenderState();
  };

  const updateLocalAsset = (
    assetType: "video" | "voice",
    file: File | null | undefined,
    options?: { resetRender?: boolean; silent?: boolean }
  ) => {
    if (!selectedDraft || !file) return "";

    const draftId = selectedDraft.id;
    const nextUrl = URL.createObjectURL(file);
    const currentAssets = localAssetsRef.current[draftId] ?? {};
    const previousUrl = assetType === "video" ? currentAssets.videoUrl : currentAssets.voiceUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const nextAssetsForDraft =
      assetType === "video"
        ? { ...currentAssets, videoFile: file, videoUrl: nextUrl, videoName: file.name }
        : { ...currentAssets, voiceFile: file, voiceUrl: nextUrl, voiceName: file.name };
    const nextAssets = {
      ...localAssetsRef.current,
      [draftId]: nextAssetsForDraft,
    };

    localAssetsRef.current = nextAssets;
    setLocalAssets(nextAssets);
    updateSelectedContent("reelVideoUrl", "");
    if (options?.resetRender !== false) resetRenderState();
    if (!options?.silent) {
      toast.success(
        assetType === "video" ? "Custom background video added." : "Voiceover selected."
      );
    }
    return nextUrl;
  };

  const clearLocalAsset = (assetType: "video" | "voice") => {
    if (!selectedDraft) return;

    const draftId = selectedDraft.id;
    const currentAssets = localAssetsRef.current[draftId] ?? {};
    const previousUrl = assetType === "video" ? currentAssets.videoUrl : currentAssets.voiceUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const nextAssetsForDraft =
      assetType === "video"
        ? {
            ...currentAssets,
            videoFile: undefined,
            videoUrl: undefined,
            videoName: undefined,
          }
        : {
            ...currentAssets,
            voiceFile: undefined,
            voiceUrl: undefined,
            voiceName: undefined,
          };
    const nextAssets = {
      ...localAssetsRef.current,
      [draftId]: nextAssetsForDraft,
    };

    localAssetsRef.current = nextAssets;
    setLocalAssets(nextAssets);
  };

  const clearReelVideoAsset = () => {
    clearLocalAsset("video");
    updateSelectedContent("backgroundVideoUrl", "", { invalidateReel: true });
    toast.success("Custom video removed. Template preview restored.");
  };

  const clearVoiceoverAsset = () => {
    clearLocalAsset("voice");
    updateSelectedContent("voiceoverAudioUrl", "", { invalidateReel: true });
    toast.success("Custom voiceover removed. Hindi voice script restored.");
  };

  const updateSelectedScene = (index: number, patch: Partial<ReelScene>) => {
    if (!selectedDraft || !selectedContent) return;

    const scenes = selectedContent.scenes.map((scene, sceneIndex) =>
      sceneIndex === index ? { ...scene, ...patch } : scene
    );
    const nextVoiceoverSpeech = scenes.map((scene) => scene.speechLine).join(" ");
    const key = contentKey(selectedDraft.id);
    const next = {
      ...contentOverrides,
      [key]: {
        ...(contentOverrides[key] ?? {}),
        scenes,
        voiceoverSpeech: nextVoiceoverSpeech,
        reelVideoUrl: "",
      },
    };

    setContentOverrides(next);
    writeJsonStorage(CONTENT_STORAGE_KEY, next);
    resetRenderState();
  };

  const toggleApproval = (platform: PlatformKey = activePlatform) => {
    if (!selectedDraft) return;

    const platformName = PLATFORMS.find((item) => item.key === platform)?.label ?? "Platform";
    const key = approvalKey(selectedDraft.id, platform);
    const next: ApprovalMap = { ...approvals };

    if (next[key]) {
      delete next[key];
      toast.success(`${platformName} unapproved.`);
    } else {
      next[key] = true;
      toast.success(`${platformName} approved.`);
    }

    setApprovals(next);
    writeJsonStorage(APPROVAL_STORAGE_KEY, next);
  };

  const resetCurrentRecipe = () => {
    if (!selectedDraft) return;
    const nextOverrides = { ...contentOverrides };
    delete nextOverrides[contentKey(selectedDraft.id)];
    setContentOverrides(nextOverrides);
    writeJsonStorage(CONTENT_STORAGE_KEY, nextOverrides);

    const nextApprovals = { ...approvals };
    PLATFORMS.forEach((platform) => {
      delete nextApprovals[approvalKey(selectedDraft.id, platform.key)];
    });
    setApprovals(nextApprovals);
    writeJsonStorage(APPROVAL_STORAGE_KEY, nextApprovals);
    setPublishResults([]);
    toast.success("This recipe draft has been reset.");
  };

  const selectRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setPublishResults([]);
    setPreviewSceneIndex(0);
    setPreviewPlaying(false);
    setVoicePreviewPlaying(false);
    setReelRenderProgress("");
    setReelRenderPercent(0);
    setRenderProgressOpen(false);
    clearVoicePreviewTimers();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const clearVoicePreviewTimers = () => {
    voicePreviewTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    voicePreviewTimersRef.current = [];
  };

  const scheduleScenePreview = () => {
    if (!selectedContent) return;

    clearVoicePreviewTimers();
    setPreviewSceneIndex(0);
    voicePreviewTimersRef.current = selectedContent.scenes.map((scene, index) =>
      window.setTimeout(
        () => setPreviewSceneIndex(index),
        sceneStartSecond(scene.seconds, index) * 1000
      )
    );
  };

  const stopVoicePreview = () => {
    clearVoicePreviewTimers();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    voiceAudioRef.current?.pause();
    voiceAudioRef.current = null;
    setVoicePreviewPlaying(false);
  };

  const startVoicePreview = () => {
    if (!selectedDraft || !selectedContent) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Voice preview is not available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    clearVoicePreviewTimers();

    const customVoiceUrl = selectedLocalAssets?.voiceUrl || selectedContent.voiceoverAudioUrl || "";
    if (customVoiceUrl) {
      voiceAudioRef.current?.pause();
      const audio = new Audio(customVoiceUrl);
      voiceAudioRef.current = audio;
      setVoicePreviewPlaying(true);
      scheduleScenePreview();
      audio.onended = () => {
        clearVoicePreviewTimers();
        setVoicePreviewPlaying(false);
        setPreviewPlaying(false);
      };
      audio.onerror = () => {
        clearVoicePreviewTimers();
        setVoicePreviewPlaying(false);
        setPreviewPlaying(false);
        toast.error("Unable to play the selected voiceover.");
      };
      void audio.play().catch(() => {
        clearVoicePreviewTimers();
        setVoicePreviewPlaying(false);
        setPreviewPlaying(false);
        toast.error("Unable to play the selected voiceover.");
      });
      return;
    }

    const voice = chooseSpeechVoice();
    const lines = selectedContent.scenes.length
      ? selectedContent.scenes.map((scene) => scene.speechLine)
      : [selectedContent.voiceoverSpeech];

    setVoicePreviewPlaying(true);
    lines.forEach((line, index) => {
      const utterance = new SpeechSynthesisUtterance(normalizeSpeechInput(line));
      utterance.lang = voice?.lang ?? "hi-IN";
      utterance.rate = 0.82;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
      utterance.onstart = () =>
        setPreviewSceneIndex(Math.min(index, Math.max(selectedContent.scenes.length - 1, 0)));
      if (index === lines.length - 1) {
        utterance.onend = () => {
          setVoicePreviewPlaying(false);
          setPreviewPlaying(false);
        };
        utterance.onerror = () => {
          setVoicePreviewPlaying(false);
          setPreviewPlaying(false);
        };
      }
      window.speechSynthesis.speak(utterance);
    });

    toast.success("Hindi voice preview started.");
  };

  const createDefaultVoiceoverFile = async () => {
    if (!selectedContent) throw new Error("Select a recipe first.");

    const response = await fetch("/api/admin/content-pipeline/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: selectedContent.voiceoverSpeech,
        provider: "default",
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message.replace(/^"|"$/g, "") || "Unable to generate default voice.");
    }

    const blob = await response.blob();
    return new File([blob], "kyakhayen-default-voice.m4a", {
      type: blob.type || "audio/mp4",
    });
  };

  const generateDefaultVoiceover = async () => {
    try {
      setVoiceGenerating(true);
      const file = await createDefaultVoiceoverFile();
      updateLocalAsset("voice", file);
      toast.success("Default Hindi voice selected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate default voice.");
    } finally {
      setVoiceGenerating(false);
    }
  };

  const renderSelectedReel = async () => {
    if (!selectedDraft || !selectedContent) return;

    try {
      setRenderingReel(true);
      setRenderProgressOpen(true);
      setReelRenderPercent(8);
      setReelRenderProgress("Preparing reel media...");

      let renderAudioUrl = voiceoverAudioPreviewUrl;
      if (!renderAudioUrl) {
        setVoiceGenerating(true);
        setReelRenderPercent(16);
        setReelRenderProgress("Generating default Hindi voice...");
        const file = await createDefaultVoiceoverFile();
        renderAudioUrl = updateLocalAsset("voice", file, {
          resetRender: false,
          silent: true,
        });
      }

      if (!renderAudioUrl) {
        throw new Error("Select a voiceover audio source before rendering.");
      }

      setReelRenderPercent(28);
      setReelRenderProgress("Rendering reel preview...");
      const rendered = await renderReelToBlob({
        draft: selectedDraft,
        scenes: selectedContent.scenes,
        imageUrl: selectedDraft.imageUrl,
        videoUrl: backgroundVideoPreviewUrl || null,
        audioUrl: renderAudioUrl,
        showTextOverlay: selectedContent.showReelTextOverlay,
      });
      const fileName = `${safeFileName(selectedDraft.recipeTitle)}-reel.${rendered.extension}`;
      const file = new File([rendered.blob], fileName, {
        type: rendered.mimeType || `video/${rendered.extension}`,
      });

      setReelRenderPercent(65);
      setReelRenderProgress("Uploading to S3...");
      const asset = await uploadMediaAsset(file, { contentPipeline: true }, (event) => {
        const total = event.total || file.size;
        const progress = total ? Math.round((event.loaded / total) * 100) : 0;
        setReelRenderPercent(Math.min(95, 65 + Math.round(progress * 0.3)));
        setReelRenderProgress(`Uploading to S3... ${progress}%`);
      });

      updateSelectedContent("reelVideoUrl", asset.url);
      setReelRenderPercent(100);
      setReelRenderProgress("S3 video ready.");
      setRenderProgressOpen(true);

      if (!rendered.audioAttached) throw new Error("Rendered reel is missing audio.");
      if (rendered.extension !== "mp4") {
        toast.warning("Browser rendered WebM. YouTube can upload it; Meta Reels may need an MP4 file.");
      }
      toast.success("Rendered reel saved to S3.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to render the reel.";
      setReelRenderPercent(0);
      setReelRenderProgress(message);
      setRenderProgressOpen(true);
      toast.error(message);
    } finally {
      setRenderingReel(false);
      setVoiceGenerating(false);
    }
  };

  const downloadRenderedReel = async () => {
    if (!selectedDraft || !selectedContent?.reelVideoUrl) {
      toast.error("Render the reel first.");
      return;
    }

    const extension = selectedContent.reelVideoUrl.includes(".webm") ? "webm" : "mp4";
    await downloadRemoteUrl(
      selectedContent.reelVideoUrl,
      `${safeFileName(selectedDraft.recipeTitle)}-reel.${extension}`
    );
  };

  const loadSearchedRecipes = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = recipeSearch.trim();
    if (!query) {
      toast.info("Search by recipe title or slug.");
      return;
    }

    try {
      setRecipeSearching(true);
      const response = await fetch(
        `/api/admin/content-pipeline/recipes?q=${encodeURIComponent(query)}&limit=20`
      );
      const payload = await readResponsePayload<RecipeSearchResponse>(
        response,
        "Unable to search recipes."
      );
      if (!response.ok || typeof payload === "string") {
        throw new Error(responseMessage(payload, "Unable to search recipes."));
      }

      const matchedRecipes = payload.recipes ?? [];
      if (!matchedRecipes.length) {
        toast.error(`No recipes found for "${query}".`);
        return;
      }

      setRecipeQueue((current) => mergeRecipeQueues(matchedRecipes, current));
      setSelectedRecipeId(matchedRecipes[0].id);
      setPublishResults([]);
      toast.success(`${matchedRecipes.length} recipe drafts loaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to search recipes.");
    } finally {
      setRecipeSearching(false);
    }
  };

  const publishPlatforms = async (platforms: PlatformKey[]) => {
    if (!selectedDraft || !selectedContent) return;

    const unapproved = platforms.filter(
      (platform) =>
        VIDEO_POST_PLATFORMS.includes(platform) &&
        !approvals[approvalKey(selectedDraft.id, platform)]
    );
    if (unapproved.length) {
      toast.error("Approve reel/short platforms before publishing.");
      return;
    }

    const missingRenderedVideo = platforms.filter(
      (platform) => VIDEO_POST_PLATFORMS.includes(platform) && !selectedContent.reelVideoUrl
    );
    if (missingRenderedVideo.length) {
      toast.error("Render the reel video before publishing reel/short platforms.");
      return;
    }

    try {
      setPublishing(true);
      setPublishResults([]);
      const response = await fetch("/api/admin/content-pipeline/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(platformPublishPayload(selectedDraft, selectedContent, platforms)),
      });
      const payload = await readResponsePayload<{ results?: PublishResult[] }>(
        response,
        "Unable to publish."
      );
      if (!response.ok) {
        throw new Error(responseMessage(payload, "Unable to publish."));
      }

      setPublishResults(typeof payload === "string" ? [] : (payload.results ?? []));
      toast.success("Publish request completed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to publish.");
    } finally {
      setPublishing(false);
    }
  };

  const applyScheduleState = (payload: ScheduleStateResponse | string) => {
    if (typeof payload === "string") return;
    setScheduledPosts(payload.scheduledPosts ?? []);
    setAutomationRules(payload.automationRules ?? []);
  };

  const platformRequiresApproval = (platform: PlatformKey) =>
    VIDEO_POST_PLATFORMS.includes(platform);

  const schedulePlatformBlocked = (platform: PlatformKey) => {
    if (!selectedDraft || !selectedContent || !platformRequiresApproval(platform)) return false;
    const approved = approvals[approvalKey(selectedDraft.id, platform)];
    return !approved || !selectedContent.reelVideoUrl;
  };

  const openScheduleDialog = () => {
    if (!selectedDraft || !selectedContent) return;
    setScheduleAt(defaultScheduleAtInput());
    setScheduleSelection({ [schedulePlatformBlocked(activePlatform) ? "facebook_post" : activePlatform]: true });
    setScheduleOpen(true);
  };

  const toggleSchedulePlatform = (platform: PlatformKey, checked: boolean) => {
    setScheduleSelection((current) => ({ ...current, [platform]: checked }));
  };

  const submitScheduledPost = async () => {
    if (!selectedDraft || !selectedContent) return;
    const platforms = selectedPlatforms(
      scheduleSelection,
      PLATFORMS.map((platform) => platform.key)
    );
    if (!platforms.length) {
      toast.error("Choose at least one platform to schedule.");
      return;
    }
    const blockedPlatform = platforms.find(schedulePlatformBlocked);
    if (blockedPlatform) {
      toast.error(`${platformLabel(blockedPlatform)} needs approval and a rendered video first.`);
      return;
    }
    const scheduledDate = new Date(scheduleAt);
    if (!scheduleAt || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      toast.error("Choose a future schedule time.");
      return;
    }

    try {
      setSchedulingPost(true);
      const response = await fetch("/api/admin/content-pipeline/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: selectedDraft.recipeId,
          scheduledAt: scheduledDate.toISOString(),
          payload: platformPublishPayload(selectedDraft, selectedContent, platforms),
        }),
      });
      const payload = await readResponsePayload<ScheduleStateResponse>(
        response,
        "Unable to schedule post."
      );
      if (!response.ok) {
        throw new Error(responseMessage(payload, "Unable to schedule post."));
      }
      applyScheduleState(payload);
      setScheduleOpen(false);
      toast.success("Post scheduled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to schedule post.");
    } finally {
      setSchedulingPost(false);
    }
  };

  const resetAutomationForm = () => {
    setEditingAutomationId(null);
    setAutomationForm({
      name: "Daily recipe social posts",
      platforms: defaultAutomationPlatforms,
      timeSlots: ["09:00", "18:00"],
      timeSlotDraft: "12:30",
      daysOfWeek: [],
    });
  };

  const addAutomationTimeSlot = (slot: string = automationForm.timeSlotDraft) => {
    const normalized = normalizeTimeSlot(slot);
    if (!normalized) {
      toast.error("Choose a valid publish time.");
      return;
    }
    setAutomationForm((current) => ({
      ...current,
      timeSlots: sortUniqueTimeSlots([...current.timeSlots, normalized]),
      timeSlotDraft: normalized,
    }));
  };

  const removeAutomationTimeSlot = (slot: string) => {
    setAutomationForm((current) => ({
      ...current,
      timeSlots: current.timeSlots.filter((value) => value !== slot),
    }));
  };

  const submitAutomationRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const platforms = selectedPlatforms(automationForm.platforms, SIMPLE_POST_PLATFORMS);
    const timeSlots = sortUniqueTimeSlots(automationForm.timeSlots);
    if (!platforms.length) {
      toast.error("Choose at least one simple post platform.");
      return;
    }
    if (!timeSlots.length) {
      toast.error("Add at least one publish time.");
      return;
    }

    try {
      setAutomationSaving(true);
      const response = await fetch(
        editingAutomationId
          ? `/api/admin/content-pipeline/automation-rules/${editingAutomationId}`
          : "/api/admin/content-pipeline/automation-rules",
        {
          method: editingAutomationId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: automationForm.name,
            platforms,
            timeSlots,
            daysOfWeek: automationForm.daysOfWeek,
            isActive: true,
          }),
        }
      );
      const payload = await readResponsePayload<ScheduleStateResponse>(
        response,
        "Unable to save automation."
      );
      if (!response.ok) {
        throw new Error(responseMessage(payload, "Unable to save automation."));
      }
      applyScheduleState(payload);
      resetAutomationForm();
      toast.success(editingAutomationId ? "Automation updated." : "Automation created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save automation.");
    } finally {
      setAutomationSaving(false);
    }
  };

  const editAutomationRule = (rule: ContentPipelineAutomationRuleSummary) => {
    setEditingAutomationId(rule.id);
    setAutomationForm({
      name: rule.name,
      platforms: Object.fromEntries(rule.platforms.map((platform) => [platform, true])) as ScheduleSelectionMap,
      timeSlots: rule.timeSlots,
      timeSlotDraft: rule.timeSlots[0] ?? "12:30",
      daysOfWeek: rule.daysOfWeek,
    });
  };

  const toggleAutomationRule = async (rule: ContentPipelineAutomationRuleSummary) => {
    try {
      setAutomationBusyId(rule.id);
      const response = await fetch(`/api/admin/content-pipeline/automation-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      const payload = await readResponsePayload<ScheduleStateResponse>(
        response,
        "Unable to update automation."
      );
      if (!response.ok) {
        throw new Error(responseMessage(payload, "Unable to update automation."));
      }
      applyScheduleState(payload);
      toast.success(rule.isActive ? "Automation paused." : "Automation resumed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update automation.");
    } finally {
      setAutomationBusyId(null);
    }
  };

  const deleteAutomationRule = (rule: ContentPipelineAutomationRuleSummary) => {
    void rule;
    toast.error("Open the Automation page to delete automation rules.");
  };

  const cancelScheduledPost = async (post: ContentPipelineScheduledPostSummary) => {
    try {
      const response = await fetch(`/api/admin/content-pipeline/scheduled-posts/${post.id}`, {
        method: "DELETE",
      });
      const payload = await readResponsePayload<ScheduleStateResponse>(
        response,
        "Unable to cancel schedule."
      );
      if (!response.ok) {
        throw new Error(responseMessage(payload, "Unable to cancel schedule."));
      }
      applyScheduleState(payload);
      toast.success("Scheduled post cancelled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel schedule.");
    }
  };

  const refreshSocialSetup = useCallback(async () => {
    const response = await fetch("/api/admin/content-pipeline/social-setup");
    const payload = await readResponsePayload<SocialSetupStatus>(
      response,
      "Unable to refresh social setup."
    );
    if (!response.ok || typeof payload === "string") {
      throw new Error(responseMessage(payload, "Unable to refresh social setup."));
    }
    setSocialSetup(payload);
    const pinterestPlatform = payload.platforms.find((platform) => platform.key === "pinterest");
    setSelectedPinterestBoardId(pinterestPlatform?.selectedBoardId ?? "");
    return payload;
  }, []);

  const loadPinterestBoards = useCallback(async () => {
    try {
      setPinterestBoardLoading(true);
      const response = await fetch("/api/admin/content-pipeline/pinterest/boards");
      const payload = await readResponsePayload<PinterestBoardsResponse>(
        response,
        "Unable to load Pinterest boards."
      );
      if (!response.ok || typeof payload === "string") {
        throw new Error(responseMessage(payload, "Unable to load Pinterest boards."));
      }

      const boards = payload.boards ?? [];
      setPinterestBoards(boards);
      setPinterestBoardsChecked(true);
      setSelectedPinterestBoardId(payload.selectedBoardId ?? boards[0]?.id ?? "");
      if (!boards.length) {
        const pinterestPlatform = socialSetup.platforms.find(
          (platform) => platform.key === "pinterest"
        );
        toast.info(
          pinterestPlatform?.environment === "sandbox"
            ? "No Sandbox boards found. Create one here to test Pinterest publishing."
            : "No Pinterest boards found for this account."
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load Pinterest boards.");
    } finally {
      setPinterestBoardLoading(false);
    }
  }, [socialSetup.platforms]);

  const createPinterestDefaultBoard = async () => {
    try {
      setPinterestBoardCreating(true);
      const response = await fetch("/api/admin/content-pipeline/pinterest/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_default", name: "Kya Khayen Recipes" }),
      });
      const payload = await readResponsePayload<PinterestBoardsResponse>(
        response,
        "Unable to create Pinterest board."
      );
      if (!response.ok || typeof payload === "string") {
        throw new Error(responseMessage(payload, "Unable to create Pinterest board."));
      }

      const boards = payload.boards ?? (payload.board ? [payload.board] : []);
      setPinterestBoards(boards);
      setPinterestBoardsChecked(true);
      setSelectedPinterestBoardId(payload.selectedBoardId ?? payload.board?.id ?? "");
      await refreshSocialSetup();
      toast.success("Pinterest board created and selected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create Pinterest board.");
    } finally {
      setPinterestBoardCreating(false);
    }
  };

  const savePinterestBoard = async () => {
    if (!selectedPinterestBoardId) {
      toast.error("Choose a Pinterest board.");
      return;
    }

    try {
      setPinterestBoardSaving(true);
      const response = await fetch("/api/admin/content-pipeline/pinterest/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: selectedPinterestBoardId }),
      });
      const payload = await readResponsePayload<PinterestBoardsResponse>(
        response,
        "Unable to save Pinterest board."
      );
      if (!response.ok || typeof payload === "string") {
        throw new Error(responseMessage(payload, "Unable to save Pinterest board."));
      }

      await refreshSocialSetup();
      toast.success("Pinterest board saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save Pinterest board.");
    } finally {
      setPinterestBoardSaving(false);
    }
  };

  useEffect(() => {
    if (handledPinterestReturnRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const pinterestStatus = params.get("pinterest");
    if (!pinterestStatus) return;

    handledPinterestReturnRef.current = true;
    params.delete("pinterest");
    params.delete("message");
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    if (pinterestStatus === "connected") {
      toast.success("Pinterest connected. Select a board to finish setup.");
      window.setTimeout(() => {
        void refreshSocialSetup().then(() => loadPinterestBoards());
      }, 0);
      return;
    }

    toast.error("Pinterest connection failed.");
  }, [loadPinterestBoards, refreshSocialSetup]);

  const activePlatformMeta = PLATFORMS.find((platform) => platform.key === activePlatform);
  const currentPlatformNeedsApproval = VIDEO_POST_PLATFORMS.includes(activePlatform);
  const currentPlatformPublishReady =
    Boolean(selectedDraft && selectedContent) &&
    (!currentPlatformNeedsApproval || (currentApproved && Boolean(selectedContent?.reelVideoUrl)));
  const publishModeLabel =
    socialSetup.mode === "live" ? "Live publishing" : "Dry run mode";
  const configuredPlatformCount = socialSetup.platforms.filter((platform) => platform.configured)
    .length;
  const upcomingScheduleCount = scheduledPosts.filter((post) => post.status === "SCHEDULED")
    .length;
  const activeAutomationCount = automationRules.filter((rule) => rule.isActive).length;
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const publishedTodayCount = scheduledPosts.filter(
    (post) =>
      post.processedAt &&
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(post.processedAt)) === todayKey &&
      (post.status === "COMPLETED" || post.status === "PARTIAL_FAILED")
  ).length;
  const allAttempts = scheduledPosts.flatMap((post) => post.publishAttempts);
  const successfulAttempts = allAttempts.filter((attempt) => isAttemptSuccess(attempt.status));
  const successRate = allAttempts.length
    ? Math.round((successfulAttempts.length / allAttempts.length) * 100)
    : 0;
  const totalEngagement = scheduledPosts.reduce((total, post) => total + engagementTotal(post), 0);
  const nextScheduledPost =
    scheduledPosts
      .filter((post) => post.status === "SCHEDULED")
      .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime())[0] ??
    null;
  const platformReports = SIMPLE_POST_PLATFORMS.map((platform) => {
    const attempts = allAttempts.filter((attempt) => attempt.platform === platform);
    const successful = attempts.filter((attempt) => isAttemptSuccess(attempt.status)).length;
    return {
      platform,
      attempts: attempts.length,
      successful,
      failed: attempts.filter((attempt) => attempt.status === "failed").length,
      reactions: attempts.reduce((total, attempt) => total + (attempt.reactionCount ?? 0), 0),
      comments: attempts.reduce((total, attempt) => total + (attempt.commentCount ?? 0), 0),
      shares: attempts.reduce((total, attempt) => total + (attempt.shareCount ?? 0), 0),
      views: attempts.reduce((total, attempt) => total + (attempt.viewCount ?? 0), 0),
      lastStatus: attempts[0]?.status ?? "waiting",
    };
  });
  const showInlineAutomationControlRoom = false;

  return (
    <div className="space-y-5">
      <Dialog
        open={renderProgressOpen || renderingReel}
        onOpenChange={(open) => {
          if (!renderingReel) setRenderProgressOpen(open);
        }}
      >
        <DialogContent showCloseButton={!renderingReel} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reel render</DialogTitle>
            <DialogDescription>
              {selectedDraft
                ? `${selectedDraft.recipeTitle} is being prepared for upload.`
                : "Preparing the selected reel."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                {renderingReel ? (
                  <LoaderCircle className="size-4 animate-spin text-[#c43127]" />
                ) : reelRenderPercent === 100 ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <RotateCcw className="size-4 text-amber-600" />
                )}
                <span>{reelRenderProgress || "Waiting to start..."}</span>
              </div>
              <span className="shrink-0 text-sm font-semibold">{reelRenderPercent}%</span>
            </div>
            <Progress value={reelRenderPercent} className="h-2.5" />
            {selectedContent?.reelVideoUrl && reelRenderPercent === 100 && (
              <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Saved to S3</p>
                <p className="mt-1 break-all">{selectedContent.reelVideoUrl}</p>
              </div>
            )}
            {!renderingReel && reelRenderPercent === 100 && (
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setRenderProgressOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="size-5" />
              Schedule social post
            </DialogTitle>
            <DialogDescription>
              Choose a future publish time. Simple posts can run without approval; reels and shorts
              need approval and a rendered video URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-schedule-at">Publish at</Label>
              <Input
                id="content-schedule-at"
                type="datetime-local"
                value={scheduleAt}
                min={localDatetimeInputValue(new Date())}
                onChange={(event) => setScheduleAt(event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const blocked = schedulePlatformBlocked(platform.key);
                const checked = Boolean(scheduleSelection[platform.key]);
                return (
                  <label
                    key={platform.key}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-sm",
                      blocked ? "bg-muted/50 text-muted-foreground" : "bg-background"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={blocked}
                      onCheckedChange={(value) => toggleSchedulePlatform(platform.key, value === true)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">{platform.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {blocked
                          ? "Approve this platform and render the reel video first."
                          : platform.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitScheduledPost()} disabled={schedulingPost}>
              {schedulingPost ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <CalendarClock className="mr-2 size-4" />
              )}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="rounded-[24px] border border-[#eadcc8] bg-[#fffdf8] p-5 shadow-sm dark:border-white/10 dark:bg-[#10221d]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Badge
              variant="outline"
              className="border-[#ead6b9] bg-white text-[#a86822] dark:border-white/10 dark:bg-white/5"
            >
              <Sparkles className="mr-2 size-3.5" />
              Auto Content Pipeline
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#30261f] dark:text-[#eef2ec]">
              Create reels and social posts from recipes
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6c5b4d] dark:text-[#c9d6cf]">
              Select a recipe, edit the reel scenes and captions, upload the Hindi voiceover, then
              approve and publish the selected platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1",
                socialSetup.mode === "live"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}
            >
              {publishModeLabel}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {recipeQueue.length} recipes loaded
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {configuredPlatformCount}/{socialSetup.platforms.length} configured
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {upcomingScheduleCount} scheduled
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {activeAutomationCount} automations
            </Badge>
            {selectedDraft && (
              <Badge variant="outline" className="px-3 py-1">
                {approvedPlatformCount}/{PLATFORMS.length} approved
              </Badge>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/content-pipeline/automation">
                <Repeat2 className="mr-2 size-4" />
                Automation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Social configuration</h2>
            <p className="text-sm text-muted-foreground">
              Connect accounts through OAuth. Tokens and selected boards are stored securely by the app.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {socialSetup.graphVersion}
          </Badge>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {socialSetup.platforms.map((platform) => {
            const pinterestConnected = platform.key === "pinterest" && platform.connected;
            const statusLabel = platform.configured
              ? "Ready"
              : pinterestConnected
                ? "Connected"
                : "Setup";
            const statusText = platform.configured
              ? "Ready in config"
              : pinterestConnected
                ? platform.note
                : platform.missing.join(", ");

            return (
              <div
                key={platform.key}
                className={cn(
                  "rounded-xl border p-3",
                  platform.key === "pinterest" && "2xl:col-span-2",
                  platform.configured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : pinterestConnected
                      ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                )}
                title={
                  platform.configured || pinterestConnected
                    ? platform.note
                    : `Missing: ${platform.missing.join(", ")}. ${platform.note}`
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{platform.label}</span>
                  {platform.configured ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold dark:bg-black/20">
                      {statusLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-80">{statusText}</p>
                {platform.setupUrl && (
                  <Button asChild variant="outline" size="xs" className="mt-3 bg-white/80 dark:bg-black/20">
                    <Link href={platform.setupUrl}>
                      {platform.configured || pinterestConnected ? "Reconnect" : "Connect"}
                    </Link>
                  </Button>
                )}
                {platform.key === "pinterest" && platform.connected && (
                  <div className="mt-3 rounded-lg border border-white/70 bg-white/70 p-2 dark:border-white/10 dark:bg-black/15">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="bg-white/80 dark:bg-black/20"
                        onClick={() => void loadPinterestBoards()}
                        disabled={pinterestBoardLoading || pinterestBoardCreating}
                      >
                        {pinterestBoardLoading ? (
                          <LoaderCircle className="mr-1.5 size-3 animate-spin" />
                        ) : (
                          <Bookmark className="mr-1.5 size-3" />
                        )}
                        Load boards
                      </Button>
                      {platform.environment === "sandbox" &&
                        pinterestBoardsChecked &&
                        pinterestBoards.length === 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="bg-white/80 dark:bg-black/20"
                            onClick={() => void createPinterestDefaultBoard()}
                            disabled={pinterestBoardCreating || pinterestBoardLoading}
                          >
                            {pinterestBoardCreating ? (
                              <LoaderCircle className="mr-1.5 size-3 animate-spin" />
                            ) : (
                              <Plus className="mr-1.5 size-3" />
                            )}
                            Create sandbox board
                          </Button>
                        )}
                      {platform.selectedBoardId && (
                        <span className="text-[11px] font-medium opacity-75">Board selected</span>
                      )}
                    </div>
                    {platform.environment === "sandbox" &&
                      pinterestBoardsChecked &&
                      pinterestBoards.length === 0 && (
                        <p className="mt-2 text-[11px] leading-4 opacity-75">
                          Sandbox boards are separate from your real Pinterest account. Create one
                          sandbox board here for trial Pin publishing.
                        </p>
                      )}
                    {pinterestBoards.length > 0 && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <select
                          value={selectedPinterestBoardId}
                          onChange={(event) => setSelectedPinterestBoardId(event.target.value)}
                          className="h-9 min-w-0 rounded-md border border-[#eadcc8] bg-white px-2 text-xs font-medium text-[#30261f] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-black/20 dark:text-white"
                        >
                          {pinterestBoards.map((board) => (
                            <option key={board.id} value={board.id}>
                              {board.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="h-9 bg-white/80 dark:bg-black/20"
                          onClick={() => void savePinterestBoard()}
                          disabled={pinterestBoardSaving}
                        >
                          {pinterestBoardSaving ? (
                            <LoaderCircle className="mr-1.5 size-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 size-3" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {showInlineAutomationControlRoom && (
      <section className="rounded-[24px] border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Gauge className="size-5 text-[#c43127]" />
              Automation control room
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recipe rotation, publishing calendar, queue, and platform reporting in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">
              IST schedule
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Next unused recipe
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Queued posts", value: upcomingScheduleCount, icon: CalendarClock },
            { label: "Active rules", value: activeAutomationCount, icon: Repeat2 },
            { label: "Published today", value: publishedTodayCount, icon: Send },
            { label: "Success rate", value: `${successRate}%`, icon: TrendingUp },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <metric.icon className="size-4 text-[#c43127]" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="rounded-2xl border bg-background p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <ListChecks className="size-5 text-[#c43127]" />
                  Rule builder
                </h3>
                <p className="text-sm text-muted-foreground">
                  Auto-pick skips any recipe already scheduled, published, or failed in automation history.
                </p>
              </div>
              {editingAutomationId && (
                <Button variant="outline" size="sm" onClick={resetAutomationForm}>
                  <XCircle className="mr-2 size-4" />
                  Cancel edit
                </Button>
              )}
            </div>

            <form className="mt-4 grid gap-5" onSubmit={(event) => void submitAutomationRule(event)}>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-2">
                  <Label htmlFor="automation-name">Rule name</Label>
                  <Input
                    id="automation-name"
                    value={automationForm.name}
                    onChange={(event) =>
                      setAutomationForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="rounded-xl border bg-muted/25 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Recipe source</p>
                  <p className="mt-2 text-sm font-semibold">Next unused ready recipe</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Uses published recipes from the full database, not just the visible list.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="font-semibold">Publish times</Label>
                    <Badge variant="outline">Asia/Kolkata</Badge>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="time"
                      value={automationForm.timeSlotDraft}
                      onChange={(event) =>
                        setAutomationForm((current) => ({
                          ...current,
                          timeSlotDraft: event.target.value,
                        }))
                      }
                      className="sm:max-w-40"
                    />
                    <Button type="button" variant="outline" onClick={() => addAutomationTimeSlot()}>
                      <Plus className="mr-2 size-4" />
                      Add time
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {automationForm.timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => removeAutomationTimeSlot(slot)}
                        className="inline-flex h-8 items-center gap-2 rounded-md border border-[#d8ad63] bg-[#fff8ed] px-3 text-sm font-semibold text-[#30261f] transition hover:bg-[#ffeccd] dark:bg-[#18342c] dark:text-[#eef2ec]"
                      >
                        <Clock className="size-3.5" />
                        {slot}
                        <XCircle className="size-3.5 opacity-70" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_TIME_SLOTS.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => addAutomationTimeSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border p-3">
                  <Label className="font-semibold">Days</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DAY_OPTIONS.map((day) => {
                      const checked = automationForm.daysOfWeek.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            setAutomationForm((current) => ({
                              ...current,
                              daysOfWeek: checked
                                ? current.daysOfWeek.filter((value) => value !== day.value)
                                : [...current.daysOfWeek, day.value].sort(),
                            }))
                          }
                          className={cn(
                            "h-8 rounded-md border px-3 text-xs font-semibold transition",
                            checked
                              ? "border-[#c43127] bg-[#fff1ee] text-[#9d241d]"
                              : "bg-background text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                    <Button
                      type="button"
                      variant={automationForm.daysOfWeek.length ? "outline" : "default"}
                      size="sm"
                      onClick={() => setAutomationForm((current) => ({ ...current, daysOfWeek: [] }))}
                    >
                      Every day
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="font-semibold">Simple post platforms</Label>
                  <Badge variant="outline">{selectedPlatforms(automationForm.platforms, SIMPLE_POST_PLATFORMS).length} selected</Badge>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {SIMPLE_POST_PLATFORMS.map((platform) => (
                    <label
                      key={platform}
                      className={cn(
                        "flex min-h-16 items-center gap-2 rounded-xl border p-3 text-sm transition",
                        automationForm.platforms[platform]
                          ? "border-[#c43127] bg-[#fff6f4]"
                          : "bg-background hover:bg-muted/40"
                      )}
                    >
                      <Checkbox
                        checked={Boolean(automationForm.platforms[platform])}
                        onCheckedChange={(checked) =>
                          setAutomationForm((current) => ({
                            ...current,
                            platforms: { ...current.platforms, [platform]: checked === true },
                          }))
                        }
                      />
                      <span className="font-medium">{platformLabel(platform)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border bg-muted/25 p-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {automationForm.timeSlots.length} slots ·{" "}
                    {automationForm.daysOfWeek.length ? `${automationForm.daysOfWeek.length} days` : "Every day"} ·{" "}
                    {selectedPlatforms(automationForm.platforms, SIMPLE_POST_PLATFORMS).length} platforms
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next created queue item will show exact recipe, time, and platform outcome below.
                  </p>
                </div>
                <Button type="submit" disabled={automationSaving}>
                  {automationSaving ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : editingAutomationId ? (
                    <Pencil className="mr-2 size-4" />
                  ) : (
                    <Plus className="mr-2 size-4" />
                  )}
                  {editingAutomationId ? "Update rule" : "Create rule"}
                </Button>
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarDays className="size-5 text-[#c43127]" />
                  Next publish plan
                </h3>
                <Badge variant="outline">{upcomingScheduleCount} queued</Badge>
              </div>
              {nextScheduledPost ? (
                <div className="mt-4 overflow-hidden rounded-2xl border">
                  <div className="relative aspect-[16/9] bg-muted">
                    {nextScheduledPost.imageUrl ? (
                      <Image
                        src={nextScheduledPost.imageUrl}
                        alt={nextScheduledPost.recipeTitle}
                        fill
                        unoptimized
                        sizes="420px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 font-semibold">{nextScheduledPost.recipeTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatScheduleDate(nextScheduledPost.scheduledAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {nextScheduledPost.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platformLabel(platform)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Queue is empty.
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Repeat2 className="size-5 text-[#c43127]" />
                Active automations
              </h3>
              <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {automationRules.length ? (
                  automationRules.map((rule) => (
                    <div key={rule.id} className="rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{rule.name}</p>
                            <Badge variant="outline">{rule.isActive ? "Active" : "Paused"}</Badge>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {rule.timeSlots.join(", ")} IST ·{" "}
                            {rule.daysOfWeek.length
                              ? DAY_OPTIONS.filter((day) => rule.daysOfWeek.includes(day.value))
                                  .map((day) => day.label)
                                  .join(", ")
                              : "Every day"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Next: {formatScheduleDate(rule.nextScheduledAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Edit ${rule.name}`}
                            onClick={() => editAutomationRule(rule)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${rule.name}`}
                            disabled={automationBusyId === rule.id}
                            onClick={() => void deleteAutomationRule(rule)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={automationBusyId === rule.id}
                          onClick={() => void toggleAutomationRule(rule)}
                        >
                          {rule.isActive ? <Pause className="mr-1 size-4" /> : <Play className="mr-1 size-4" />}
                          {rule.isActive ? "Pause" : "Resume"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No automation rules yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]">
          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="size-5 text-[#c43127]" />
                  Scheduled queue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Exact recipe, publish time, platform list, and last result.
                </p>
              </div>
              <Badge variant="outline">{upcomingScheduleCount} queued</Badge>
            </div>

            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {scheduledPosts.length ? (
                scheduledPosts.map((post) => (
                  <div key={post.id} className="rounded-xl border p-3">
                    <div className="grid gap-3 lg:grid-cols-[72px_minmax(0,1fr)_auto] lg:items-start">
                      <div className="relative hidden aspect-square overflow-hidden rounded-xl bg-muted lg:block">
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt={post.recipeTitle}
                            fill
                            unoptimized
                            sizes="72px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="line-clamp-2 font-semibold">{post.recipeTitle}</p>
                          <Badge variant="outline" className="shrink-0">
                            {statusLabel(post.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatScheduleDate(post.scheduledAt)} ·{" "}
                          {post.source === "AUTOMATION" ? "Automation" : "Manual"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.platforms.map((platform) => (
                            <Badge key={platform} variant="outline">
                              {platformLabel(platform)}
                            </Badge>
                          ))}
                        </div>
                        {post.lastError && (
                          <p className="mt-2 line-clamp-2 rounded-lg bg-destructive/10 px-2 py-1 text-xs text-destructive">
                            {post.lastError}
                          </p>
                        )}
                      </div>
                      {post.status === "SCHEDULED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void cancelScheduledPost(post)}
                        >
                          <XCircle className="mr-2 size-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                    {post.publishAttempts.length > 0 && (
                      <div className="mt-3 grid gap-2 border-t pt-3 md:grid-cols-2">
                        {post.publishAttempts.map((attempt, index) => (
                          <div
                            key={`${post.id}-${attempt.platform}-${attempt.status}-${index}`}
                            className="rounded-lg border bg-muted/25 p-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold">{platformLabel(attempt.platform)}</span>
                              <Badge variant="outline">{attempt.status.replaceAll("_", " ")}</Badge>
                            </div>
                            <p className="mt-1 line-clamp-2 text-muted-foreground">{attempt.message}</p>
                            <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                              <span>R {formatMetric(attempt.reactionCount ?? 0)}</span>
                              <span>C {formatMetric(attempt.commentCount ?? 0)}</span>
                              <span>S {formatMetric(attempt.shareCount ?? 0)}</span>
                              <span>V {formatMetric(attempt.viewCount ?? 0)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No scheduled posts yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="size-5 text-[#c43127]" />
                  Platform report
                </h3>
                <p className="text-sm text-muted-foreground">
                  Publish result and engagement columns are ready for metric sync.
                </p>
              </div>
              <Badge variant="outline">{formatMetric(totalEngagement)} engagement</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {platformReports.map((report) => (
                <div key={report.platform} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{platformLabel(report.platform)}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.successful}/{report.attempts} successful · {report.failed} failed
                      </p>
                    </div>
                    <Badge variant="outline">{report.lastStatus.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="font-semibold">{formatMetric(report.reactions)}</p>
                      <p className="text-muted-foreground">Reactions</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="font-semibold">{formatMetric(report.comments)}</p>
                      <p className="text-muted-foreground">Comments</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="font-semibold">{formatMetric(report.shares)}</p>
                      <p className="text-muted-foreground">Shares</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="font-semibold">{formatMetric(report.views)}</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="self-start rounded-[20px] border bg-card p-4 shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recipes</h2>
              <p className="text-sm text-muted-foreground">Search or pick a recipe to prepare.</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              title="Reset current recipe draft"
              disabled={!selectedDraft}
              onClick={resetCurrentRecipe}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>

          <form className="mt-4 space-y-2" onSubmit={loadSearchedRecipes}>
            <Label htmlFor="recipe-search" className="text-xs font-semibold">
              Find recipe
            </Label>
            <div className="grid gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="recipe-search"
                  value={recipeSearch}
                  onChange={(event) => setRecipeSearch(event.target.value)}
                  placeholder="Paneer butter masala or slug"
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={recipeSearching}>
                {recipeSearching ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Search className="mr-2 size-4" />
                )}
                Load recipe
              </Button>
            </div>
          </form>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {drafts.map((draft) => {
              const isSelected = selectedDraft?.id === draft.id;
              const approvedCount = PLATFORMS.filter(
                (platform) => approvals[approvalKey(draft.id, platform.key)]
              ).length;

              return (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => selectRecipe(draft.recipeId)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition hover:border-[#d8ad63] hover:bg-[#fff8ed] dark:hover:border-[#d8ad63] dark:hover:bg-[#18342c] dark:hover:text-[#eef2ec]",
                    isSelected
                      ? "border-[#d8ad63] bg-[#fff8ed] text-[#30261f] dark:bg-[#18342c] dark:text-[#eef2ec]"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {draft.imageUrl ? (
                        <Image
                          src={draft.imageUrl}
                          alt={draft.recipeTitle}
                          fill
                          unoptimized
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{draft.recipeTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground dark:text-[#b8c8bf]">
                        {draft.durationSeconds}s video plan · {approvedCount}/{PLATFORMS.length}{" "}
                        approved
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDraft && (
            <div className="mt-4 border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Platform drafts</h3>
                  <p className="text-xs text-muted-foreground">
                    Select one, preview it, then approve and publish.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {approvedPlatformCount}/{PLATFORMS.length}
                </Badge>
              </div>
              <div className="grid gap-2">
                {PLATFORMS.map((platform) => {
                  const isActive = activePlatform === platform.key;
                  const isApproved = approvals[approvalKey(selectedDraft.id, platform.key)];
                  return (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => {
                        setActivePlatform(platform.key);
                        setPublishResults([]);
                      }}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition hover:border-[#d8ad63] hover:bg-[#fff8ed] dark:hover:border-[#d8ad63] dark:hover:bg-[#18342c] dark:hover:text-[#eef2ec]",
                        isActive
                          ? "border-[#d8ad63] bg-[#fff8ed] text-[#30261f] dark:bg-[#18342c] dark:text-[#eef2ec]"
                          : "border-border bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{platform.label}</span>
                        {isApproved && <CheckCircle2 className="size-4 text-emerald-600" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground dark:text-[#b8c8bf]">
                        {platform.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-[20px] border bg-card shadow-sm">
          {selectedDraft && selectedContent ? (
            <>
              <div className="border-b p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
                      {selectedDraft.imageUrl ? (
                        <Image
                          src={selectedDraft.imageUrl}
                          alt={selectedDraft.recipeTitle}
                          fill
                          unoptimized
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-xl font-semibold">
                        {selectedDraft.recipeTitle}
                      </h2>
                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {selectedDraft.recipeUrl}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedDraft.durationSeconds}s video</Badge>
                        <Badge variant="outline">{selectedDraft.hashtags.length} hashtags</Badge>
                        <Badge
                          variant="outline"
                          className={
                            currentPlatformPublishReady
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }
                        >
                          {currentPlatformNeedsApproval
                            ? currentApproved
                              ? "Approved"
                              : "Needs approval"
                            : "Approval optional"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b p-4">
                <ReelStudio
                  draft={selectedDraft}
                  content={selectedContent}
                  activeScene={activeScene}
                  activeFrame={activeFrame}
                  previewSceneIndex={previewSceneIndex}
                  previewPlaying={previewPlaying}
                  voicePreviewPlaying={voicePreviewPlaying}
                  voiceGenerating={voiceGenerating}
                  renderingReel={renderingReel}
                  reelRenderProgress={reelRenderProgress}
                  reelVideoPreviewUrl={backgroundVideoPreviewUrl}
                  renderedReelUrl={renderedReelUrl}
                  voiceoverAudioPreviewUrl={voiceoverAudioPreviewUrl}
                  localVideoName={selectedLocalAssets?.videoName ?? ""}
                  localVoiceName={selectedLocalAssets?.voiceName ?? ""}
                  onSceneChange={updateSelectedScene}
                  onVoiceoverChange={(value) =>
                    updateSelectedContent("voiceoverSpeech", value, { invalidateReel: true })
                  }
                  onTextOverlayChange={(checked) =>
                    updateSelectedContent("showReelTextOverlay", checked, {
                      invalidateReel: true,
                    })
                  }
                  onVideoFileChange={(file) => updateLocalAsset("video", file)}
                  onVoiceFileChange={(file) => updateLocalAsset("voice", file)}
                  onGenerateVoice={() => void generateDefaultVoiceover()}
                  onClearVideo={clearReelVideoAsset}
                  onClearVoice={clearVoiceoverAsset}
                  onSceneSelect={(index) => {
                    setPreviewSceneIndex(index);
                    setPreviewPlaying(false);
                  }}
                  onPreviewToggle={() => {
                    if (previewPlaying) {
                      setPreviewPlaying(false);
                      stopVoicePreview();
                    } else {
                      setPreviewPlaying(true);
                      startVoicePreview();
                    }
                  }}
                  onVoiceToggle={() =>
                    voicePreviewPlaying ? stopVoicePreview() : startVoicePreview()
                  }
                  onRenderReel={() => void renderSelectedReel()}
                  onDownloadReel={() => void downloadRenderedReel()}
                />
              </div>

              <div className="p-4">
                <div className="min-w-0 space-y-4">
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{activePlatformMeta?.label}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              currentPlatformPublishReady
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            )}
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            {currentPlatformNeedsApproval
                              ? currentApproved
                                ? "Approved"
                                : "Approval needed"
                              : "Ready"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activePlatformMeta?.description}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          title="Copy content"
                          aria-label="Copy content"
                          onClick={() =>
                            copyText(platformCopy(selectedContent, activePlatform), "Content")
                          }
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant={currentApproved ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleApproval()}
                          className={cn(
                            currentApproved &&
                              "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                          )}
                          title={
                            currentApproved
                              ? "Move this platform back to draft"
                              : "Approve this platform"
                          }
                        >
                          {currentApproved ? (
                            <RotateCcw className="mr-1 size-4" />
                          ) : (
                            <CheckCircle2 className="mr-1 size-4" />
                          )}
                          {currentApproved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openScheduleDialog}
                          disabled={!selectedDraft || !selectedContent}
                        >
                          <CalendarClock className="mr-2 size-4" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => publishPlatforms([activePlatform])}
                          disabled={publishing || !currentPlatformPublishReady}
                        >
                          {publishing ? (
                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 size-4" />
                          )}
                          Publish
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
                      <PlatformPreview
                        platform={activePlatform}
                        draft={selectedDraft}
                        content={selectedContent}
                        reelVideoUrl={renderedReelUrl}
                      />
                      <PlatformEditor
                        platform={activePlatform}
                        content={selectedContent}
                        onChange={updateSelectedContent}
                      />
                    </div>

                    {publishResults.length > 0 && (
                      <div className="mt-4 grid gap-2 border-t pt-4">
                        {publishResults.map((result) => (
                          <div
                            key={`${result.platform}-${result.status}-${result.id ?? result.message}`}
                            className="rounded-xl border px-3 py-2 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold">
                                {platformResultLabel(result.platform)}
                              </span>
                              <Badge variant="outline">{result.status.replaceAll("_", " ")}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{result.message}</p>
                            {result.id && <p className="mt-1 text-xs">ID: {result.id}</p>}
                            {result.url && (
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block break-all text-xs font-semibold text-blue-600"
                              >
                                {result.url}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-muted-foreground">No recipe drafts found.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function ReelStudio({
  draft,
  content,
  activeScene,
  activeFrame,
  previewSceneIndex,
  previewPlaying,
  voicePreviewPlaying,
  voiceGenerating,
  renderingReel,
  reelRenderProgress,
  reelVideoPreviewUrl,
  renderedReelUrl,
  voiceoverAudioPreviewUrl,
  localVideoName,
  localVoiceName,
  onSceneChange,
  onVoiceoverChange,
  onTextOverlayChange,
  onVideoFileChange,
  onVoiceFileChange,
  onGenerateVoice,
  onClearVideo,
  onClearVoice,
  onSceneSelect,
  onPreviewToggle,
  onVoiceToggle,
  onRenderReel,
  onDownloadReel,
}: {
  draft: ContentDraft;
  content: EditableContent;
  activeScene: ReelScene | null;
  activeFrame: { objectPosition: string; transform: string };
  previewSceneIndex: number;
  previewPlaying: boolean;
  voicePreviewPlaying: boolean;
  voiceGenerating: boolean;
  renderingReel: boolean;
  reelRenderProgress: string;
  reelVideoPreviewUrl: string;
  renderedReelUrl: string;
  voiceoverAudioPreviewUrl: string;
  localVideoName: string;
  localVoiceName: string;
  onSceneChange: (index: number, patch: Partial<ReelScene>) => void;
  onVoiceoverChange: (value: string) => void;
  onTextOverlayChange: (checked: boolean) => void;
  onVideoFileChange: (file: File | null | undefined) => void;
  onVoiceFileChange: (file: File | null | undefined) => void;
  onGenerateVoice: () => void;
  onClearVideo: () => void;
  onClearVoice: () => void;
  onSceneSelect: (index: number) => void;
  onPreviewToggle: () => void;
  onVoiceToggle: () => void;
  onRenderReel: () => void;
  onDownloadReel: () => void;
}) {
  const editableScene = content.scenes[previewSceneIndex] ?? content.scenes[0] ?? null;
  const reelVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = reelVideoRef.current;
    if (!video) return;

    if (previewPlaying) {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [previewPlaying, reelVideoPreviewUrl]);

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Reel Studio</h3>
            <p className="text-sm text-muted-foreground">
              Edit the reel text, scene direction, and Hindi voice line before approval.
            </p>
          </div>
          <Badge variant="outline">{draft.durationSeconds}s</Badge>
        </div>

        <div className="mt-4 flex justify-center xl:justify-start">
          <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-[28px] border-[10px] border-[#19130f] bg-[#15100d] shadow-xl">
            {reelVideoPreviewUrl ? (
              <video
                key={reelVideoPreviewUrl}
                ref={reelVideoRef}
                src={reelVideoPreviewUrl}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
            ) : draft.imageUrl ? (
              <Image
                src={draft.imageUrl}
                alt={draft.recipeTitle}
                fill
                unoptimized
                sizes="280px"
                className={cn(
                  "absolute inset-0 size-full object-cover transition-[object-position,transform] duration-[2400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  previewPlaying && "reel-template-motion"
                )}
                style={activeFrame}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#4c2d1b] to-[#111827]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.48),transparent_32%,rgba(0,0,0,0.84))]" />
            <div className="absolute left-4 top-4 flex items-center gap-2 text-sm font-bold text-white">
              <Image
                src="/assets/images/kyakhayen-logo.png"
                alt="Kya Khayen"
                width={34}
                height={34}
                unoptimized
                className="size-9 rounded-full bg-white/90 object-contain p-1 shadow-sm"
              />
              Kya Khayen?
            </div>
            {activeScene && content.showReelTextOverlay && (
              <AnimatedSceneOverlay
                scene={activeScene}
                sceneIndex={previewSceneIndex}
                sceneCount={content.scenes.length}
              />
            )}
          </div>
        </div>

        <ReelAssetControls
          content={content}
          reelVideoPreviewUrl={reelVideoPreviewUrl}
          voiceoverAudioPreviewUrl={voiceoverAudioPreviewUrl}
          localVideoName={localVideoName}
          localVoiceName={localVoiceName}
          voiceGenerating={voiceGenerating}
          onTextOverlayChange={onTextOverlayChange}
          onVideoFileChange={onVideoFileChange}
          onVoiceFileChange={onVoiceFileChange}
          onGenerateVoice={onGenerateVoice}
          onClearVideo={onClearVideo}
          onClearVoice={onClearVoice}
        />
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onPreviewToggle}>
            {previewPlaying ? (
              <Pause className="mr-2 size-4" />
            ) : (
              <Play className="mr-2 size-4" />
            )}
            {previewPlaying ? "Pause" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={onVoiceToggle}>
            {voicePreviewPlaying ? (
              <Pause className="mr-2 size-4" />
            ) : (
              <Volume2 className="mr-2 size-4" />
            )}
            {voicePreviewPlaying ? "Stop" : "Voice"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRenderReel}
            disabled={renderingReel || voiceGenerating}
            title={
              voiceoverAudioPreviewUrl
                ? "Render reel with selected voiceover"
                : "Default Hindi voice will be generated before rendering"
            }
          >
            {renderingReel ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {renderedReelUrl ? "Re-render" : "Render reel"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadReel}
            disabled={!renderedReelUrl || renderingReel}
          >
            <Download className="mr-2 size-4" />
            Download
          </Button>
        </div>

        {(renderedReelUrl || reelRenderProgress) && (
          <div className="rounded-xl border bg-background p-3 text-xs leading-5 text-muted-foreground">
            {reelRenderProgress ? (
              <p>{reelRenderProgress}</p>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Rendered reel ready</p>
                <p className="break-all">S3 URL: {renderedReelUrl}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">Storyboard</h4>
            <span className="text-xs text-muted-foreground">Tap a step to edit</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {content.scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSceneSelect(index)}
              className={cn(
                "min-h-[118px] overflow-hidden rounded-xl border bg-background p-3 text-left transition hover:border-[#d8ad63] hover:bg-[#fff8ed] dark:hover:border-[#d8ad63] dark:hover:bg-[#18342c] dark:hover:text-[#eef2ec]",
                index === previewSceneIndex &&
                  "border-[#d8ad63] bg-[#fff8ed] text-[#30261f] dark:bg-[#18342c] dark:text-[#eef2ec]"
              )}
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Step {index + 1}
                </span>
                <Badge variant="outline" className="shrink-0">
                  {scene.seconds}s
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5">
                {scene.text || scene.label}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground dark:text-[#b8c8bf]">
                {scene.speechLine}
              </p>
            </button>
          ))}
          </div>
        </div>

        {editableScene && (
          <div className="grid gap-3 rounded-2xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold">Edit selected scene</h4>
                <p className="text-xs text-muted-foreground">
                  These fields update the preview and the voice script immediately.
                </p>
              </div>
              <Badge variant="outline">{editableScene.seconds}s</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>On-screen text</Label>
                <Textarea
                  value={editableScene.text}
                  onChange={(event) =>
                    onSceneChange(previewSceneIndex, { text: event.target.value })
                  }
                  className="min-h-24 resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label>Visual direction</Label>
                <Textarea
                  value={editableScene.visual}
                  onChange={(event) =>
                    onSceneChange(previewSceneIndex, { visual: event.target.value })
                  }
                  className="min-h-24 resize-y"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hindi voice line</Label>
              <Textarea
                value={editableScene.speechLine}
                onChange={(event) =>
                  onSceneChange(previewSceneIndex, {
                    speechLine: event.target.value,
                    voiceoverLine: event.target.value,
                  })
                }
                className="min-h-24 resize-y"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Full Hindi voiceover script</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Copy full script"
              aria-label="Copy full Hindi voiceover script"
              onClick={() => copyText(content.voiceoverSpeech, "Voiceover script")}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <Textarea
            value={content.voiceoverSpeech}
            onChange={(event) => onVoiceoverChange(event.target.value)}
            className="min-h-32 resize-y"
          />
          <p className="text-xs text-muted-foreground">
            This full script is used for the final Hindi MP3. Scene voice lines above can still be
            edited separately.
          </p>
        </div>
      </div>
    </div>
  );
}

function AnimatedSceneOverlay({
  scene,
  sceneIndex,
  sceneCount,
}: {
  scene: ReelScene;
  sceneIndex: number;
  sceneCount: number;
}) {
  const progress = (sceneIndex + 1) / sceneCount;

  return (
    <div
      key={scene.id}
      className="reel-scene-overlay-in absolute inset-x-5 bottom-9"
    >
      <h4
        className={cn(
          "font-black leading-none text-white drop-shadow-lg",
          previewTextSize(scene.text)
        )}
      >
        {scene.text}
      </h4>
      <p className="mt-3 rounded-2xl bg-black/48 px-3 py-2 text-sm font-semibold leading-snug text-white/95 backdrop-blur">
        {scene.speechLine}
      </p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-[#f3b33d] transition-[width] duration-[1800ms] ease-linear"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ReelAssetControls({
  content,
  reelVideoPreviewUrl,
  voiceoverAudioPreviewUrl,
  localVideoName,
  localVoiceName,
  voiceGenerating,
  onTextOverlayChange,
  onVideoFileChange,
  onVoiceFileChange,
  onGenerateVoice,
  onClearVideo,
  onClearVoice,
}: {
  content: EditableContent;
  reelVideoPreviewUrl: string;
  voiceoverAudioPreviewUrl: string;
  localVideoName: string;
  localVoiceName: string;
  voiceGenerating: boolean;
  onTextOverlayChange: (checked: boolean) => void;
  onVideoFileChange: (file: File | null | undefined) => void;
  onVoiceFileChange: (file: File | null | undefined) => void;
  onGenerateVoice: () => void;
  onClearVideo: () => void;
  onClearVoice: () => void;
}) {
  const hasCustomVideo = Boolean(reelVideoPreviewUrl || content.backgroundVideoUrl);
  const hasCustomVoice = Boolean(voiceoverAudioPreviewUrl || content.voiceoverAudioUrl || localVoiceName);

  return (
    <div className="mt-4 rounded-2xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">Custom reel assets</h4>
          <p className="text-xs leading-5 text-muted-foreground">
            Use your own video or voiceover. Remove them to return to the recipe template.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {hasCustomVideo || hasCustomVoice ? "Custom" : "Template"}
        </Badge>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="flex items-start gap-3 rounded-xl border bg-muted/25 p-3">
          <Checkbox
            checked={content.showReelTextOverlay}
            onCheckedChange={(checked) => onTextOverlayChange(Boolean(checked))}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-semibold">Show text overlay</span>
            <span className="block text-xs leading-5 text-muted-foreground">
              Turn this off when your own video already has text or you want a clean reel.
            </span>
          </span>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Background video</Label>
            {hasCustomVideo && (
              <Button type="button" variant="ghost" size="sm" onClick={onClearVideo}>
                Remove
              </Button>
            )}
          </div>
          <Input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(event) => onVideoFileChange(event.target.files?.[0])}
          />
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {localVideoName
              ? `Local preview: ${localVideoName}`
              : "No custom video. The current image-motion template is active."}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Voiceover audio</Label>
            {hasCustomVoice && (
              <Button type="button" variant="ghost" size="sm" onClick={onClearVoice}>
                Remove
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerateVoice}
              disabled={voiceGenerating}
            >
              {voiceGenerating ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Volume2 className="mr-2 size-4" />
              )}
              Default voice
            </Button>
          </div>
          <Input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4"
            onChange={(event) => onVoiceFileChange(event.target.files?.[0])}
          />
          {voiceoverAudioPreviewUrl && (
            <audio controls src={voiceoverAudioPreviewUrl} className="w-full" />
          )}
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {localVoiceName
              ? `Selected audio: ${localVoiceName}`
              : "Use default voice, or upload your own MP3/WAV to override it."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlatformPreview({
  platform,
  draft,
  content,
  reelVideoUrl,
}: {
  platform: PlatformKey;
  draft: ContentDraft;
  content: EditableContent;
  reelVideoUrl: string;
}) {
  const firstScene = content.scenes[0];
  const reelCaption = content.instagramCaption;
  const facebookPreviewCopy = compactPreviewCopy(content.facebookPost, 170);
  const linkedinPreviewCopy = compactPreviewCopy(content.linkedinPost, 190);

  if (platform === "facebook_post") {
    return (
      <div className="rounded-2xl border bg-[#f0f2f5] p-3 text-[#050505] dark:border-white/10 dark:bg-[#0f1720]">
        <div className="w-full max-w-full overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#1f2937] dark:text-[#f8fafc]">
          <div className="flex items-center gap-2 p-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#f3b33d] text-sm font-bold text-[#2d160b]">
              K
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Kya Khayen?</p>
              <p className="text-xs text-[#65676b] dark:text-slate-400">Just now · Public</p>
            </div>
            <MoreHorizontal className="ml-auto size-5 text-[#65676b] dark:text-slate-300" />
          </div>
          <div className="px-3 pb-3">
            <p className="max-h-[92px] overflow-hidden whitespace-pre-line text-sm leading-5">
              {facebookPreviewCopy}
            </p>
          </div>
          <div className="mx-3 overflow-hidden rounded-xl border bg-[#f0f2f5] dark:border-white/10 dark:bg-[#111827]">
            <PreviewImage
              draft={draft}
              className="aspect-[1.91/1]"
              sizes="(max-width: 1280px) 320px, 360px"
            />
            <div className="border-t p-3 dark:border-white/10">
              <p className="text-[11px] uppercase text-[#65676b] dark:text-slate-400">
                kyakhayen.com
              </p>
              <h4 className="line-clamp-2 text-sm font-semibold">{draft.recipeTitle}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-[#65676b] dark:text-slate-400">
                Open the full step-by-step recipe on Kya Khayen.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t px-2 py-1 text-xs font-semibold text-[#65676b] dark:border-white/10 dark:text-slate-300">
            <span className="flex items-center justify-center gap-1 rounded-md py-2">
              <ThumbsUp className="size-4" />
              Like
            </span>
            <span className="flex items-center justify-center gap-1 rounded-md py-2">
              <MessageCircle className="size-4" />
              Comment
            </span>
            <span className="flex items-center justify-center gap-1 rounded-md py-2">
              <Share2 className="size-4" />
              Share
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "instagram_photo") {
    return (
      <div className="rounded-2xl border bg-[#fafafa] p-3 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="mx-auto max-w-[330px] overflow-hidden rounded-xl border bg-white text-[#262626] shadow-sm dark:border-white/10 dark:bg-[#111827] dark:text-[#f8fafc]">
          <div className="flex items-center gap-2 p-3">
            <span className="grid size-8 place-items-center rounded-full bg-[#f3b33d] text-xs font-bold text-[#2d160b]">
              K
            </span>
            <p className="text-sm font-semibold">kyakhayen</p>
            <MoreHorizontal className="ml-auto size-5" />
          </div>
          <PreviewImage draft={draft} className="aspect-square" sizes="330px" />
          <div className="flex items-center gap-3 p-3">
            <Heart className="size-5" />
            <MessageCircle className="size-5" />
            <Share2 className="size-5" />
            <Bookmark className="ml-auto size-5" />
          </div>
          <div className="space-y-1 px-3 pb-3 text-sm">
            <p className="font-semibold">kyakhayen</p>
            <p className="line-clamp-5 whitespace-pre-line">{content.instagramCaption}</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "pinterest_pin") {
    return (
      <div className="rounded-2xl border bg-[#f7f1ed] p-3 dark:border-white/10 dark:bg-[#15100f]">
        <div className="mx-auto max-w-[300px] overflow-hidden rounded-[24px] bg-white p-2 text-[#211922] shadow-sm dark:bg-[#1f1719] dark:text-[#f8fafc]">
          <PreviewImage draft={draft} className="aspect-[3/4] rounded-[18px]" sizes="300px" />
          <div className="p-2">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="line-clamp-2 text-base font-semibold">{content.pinterestTitle}</h4>
              <span className="rounded-full bg-[#e60023] px-3 py-1 text-xs font-bold text-white">
                Save
              </span>
            </div>
            <p className="line-clamp-4 text-sm text-[#5f4b55] dark:text-slate-300">
              {content.pinterestDescription}
            </p>
            <p className="mt-3 line-clamp-1 text-xs font-semibold">kyakhayen.com</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "youtube_short") {
    return (
      <div className="rounded-2xl border bg-[#0f0f0f] p-3 text-white dark:border-white/10">
        <div className="relative mx-auto aspect-[9/16] max-w-[260px] overflow-hidden rounded-[28px] bg-black">
          {reelVideoUrl ? (
            <video
              key={reelVideoUrl}
              src={reelVideoUrl}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <PreviewImage draft={draft} className="absolute inset-0 size-full" sizes="260px" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.06)_40%,rgba(0,0,0,0.88))]" />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 text-xs">
            <ThumbsUp className="size-5" />
            <MessageCircle className="size-5" />
            <Share2 className="size-5" />
          </div>
          {content.showReelTextOverlay && (
            <div className="absolute inset-x-4 bottom-5">
              <p className="text-sm font-semibold">@kyakhayen</p>
              <h4 className="mt-2 line-clamp-2 text-lg font-bold leading-tight">
                {content.youtubeTitle}
              </h4>
              <p className="mt-2 line-clamp-3 text-sm text-white/85">
                {content.youtubeDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (platform === "x_post") {
    return (
      <div className="rounded-2xl border bg-[#f7f9f9] p-3 text-[#0f1419] dark:border-white/10 dark:bg-[#071014] dark:text-[#f7f9f9]">
        <div className="mx-auto max-w-[420px] rounded-2xl border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0f1720]">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f3b33d] text-sm font-bold text-[#2d160b]">
              K
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-bold">Kya Khayen?</span>
                <span className="text-[#536471] dark:text-slate-400">@kyakhayen · now</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-5">{content.xPost}</p>
              <div className="mt-3 overflow-hidden rounded-2xl border dark:border-white/10">
                <PreviewImage draft={draft} className="aspect-[16/9]" sizes="420px" />
                <div className="border-t p-3 dark:border-white/10">
                  <p className="text-xs text-[#536471] dark:text-slate-400">kyakhayen.com</p>
                  <p className="line-clamp-2 text-sm font-semibold">{draft.recipeTitle}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-[#536471] dark:text-slate-400">
                <MessageCircle className="size-4" />
                <Share2 className="size-4" />
                <Heart className="size-4" />
                <Bookmark className="size-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "linkedin_post") {
    return (
      <div className="rounded-2xl border bg-[#f4f2ee] p-3 text-[#191919] dark:border-white/10 dark:bg-[#111827] dark:text-[#f8fafc]">
        <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#1f2937]">
          <div className="flex items-center gap-3 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-[#f3b33d] text-sm font-bold text-[#2d160b]">
              K
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Kya Khayen?</p>
              <p className="text-xs text-[#666] dark:text-slate-400">Company Page · now</p>
            </div>
            <MoreHorizontal className="ml-auto size-5 text-[#666] dark:text-slate-300" />
          </div>
          <div className="px-4 pb-4">
            <p className="max-h-[96px] overflow-hidden whitespace-pre-line text-sm leading-5">
              {linkedinPreviewCopy}
            </p>
          </div>
          <div className="mx-4 overflow-hidden rounded-xl border dark:border-white/10">
            <PreviewImage
              draft={draft}
              className="aspect-[1.91/1]"
              sizes="(max-width: 1280px) 320px, 460px"
            />
            <div className="border-t bg-[#eef3f8] p-3 dark:border-white/10 dark:bg-[#111827]">
              <p className="text-xs text-[#666] dark:text-slate-400">kyakhayen.com</p>
              <h4 className="line-clamp-2 text-sm font-semibold">{draft.recipeTitle}</h4>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t px-3 py-2 text-xs font-semibold text-[#666] dark:border-white/10 dark:text-slate-300">
            <span className="flex items-center justify-center gap-1 py-2">
              <ThumbsUp className="size-4" />
              Like
            </span>
            <span className="flex items-center justify-center gap-1 py-2">
              <MessageCircle className="size-4" />
              Comment
            </span>
            <span className="flex items-center justify-center gap-1 py-2">
              <Share2 className="size-4" />
              Share
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-[#050505] p-3 text-white dark:border-white/10">
      <div className="relative mx-auto aspect-[9/16] max-w-[260px] overflow-hidden rounded-[28px] bg-black shadow-sm">
          {reelVideoUrl ? (
            <video
              key={reelVideoUrl}
              src={reelVideoUrl}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
        ) : (
          <PreviewImage
            draft={draft}
            className="absolute inset-0 size-full"
            imageClassName="scale-110"
            sizes="260px"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5),transparent_34%,rgba(0,0,0,0.86))]" />
        <div className="absolute left-4 right-4 top-4 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#f3b33d] text-xs font-bold text-[#2d160b]">
            K
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {platform === "facebook_reel" ? "Facebook Reels" : "Instagram Reels"}
            </p>
            <p className="text-xs text-white/75">Kya Khayen?</p>
          </div>
        </div>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 text-xs">
          <Heart className="size-5" />
          <MessageCircle className="size-5" />
          <Share2 className="size-5" />
          <MoreHorizontal className="size-5" />
        </div>
        <div className="absolute inset-x-4 bottom-5">
          {firstScene && (
            content.showReelTextOverlay && (
              <h4 className="line-clamp-3 text-3xl font-black leading-none drop-shadow">
                {firstScene.text}
              </h4>
            )
          )}
          {content.showReelTextOverlay && (
            <p className="mt-3 line-clamp-4 text-sm font-semibold leading-snug text-white/90">
              {reelCaption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlatformEditor({
  platform,
  content,
  onChange,
}: {
  platform: PlatformKey;
  content: EditableContent;
  onChange: <Field extends keyof EditableContent>(
    field: Field,
    value: EditableContent[Field]
  ) => void;
}) {
  if (platform === "facebook_post") {
    return (
      <div className="min-w-0 space-y-2">
        <Label>Post text</Label>
        <Textarea
          value={content.facebookPost}
          onChange={(event) => onChange("facebookPost", event.target.value)}
          className="min-h-72 resize-y"
        />
      </div>
    );
  }

  if (platform === "pinterest_pin") {
    return (
      <div className="min-w-0 grid gap-4">
        <div className="space-y-2">
          <Label>Pin title</Label>
          <Input
            value={content.pinterestTitle}
            onChange={(event) => onChange("pinterestTitle", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Pin description</Label>
          <Textarea
            value={content.pinterestDescription}
            onChange={(event) => onChange("pinterestDescription", event.target.value)}
            className="min-h-36 resize-y"
          />
        </div>
      </div>
    );
  }

  if (platform === "youtube_short") {
    return (
      <div className="min-w-0 grid gap-4">
        <div className="space-y-2">
          <Label>Short title</Label>
          <Input
            value={content.youtubeTitle}
            onChange={(event) => onChange("youtubeTitle", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={content.youtubeDescription}
            onChange={(event) => onChange("youtubeDescription", event.target.value)}
            className="min-h-44 resize-y"
          />
        </div>
      </div>
    );
  }

  if (platform === "x_post") {
    return (
      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>X post</Label>
          <span className="text-xs text-muted-foreground">{content.xPost.length}/280</span>
        </div>
        <Textarea
          value={content.xPost}
          onChange={(event) => onChange("xPost", event.target.value.slice(0, 280))}
          className="min-h-44 resize-y"
        />
      </div>
    );
  }

  if (platform === "linkedin_post") {
    return (
      <div className="min-w-0 space-y-2">
        <Label>LinkedIn post</Label>
        <Textarea
          value={content.linkedinPost}
          onChange={(event) => onChange("linkedinPost", event.target.value)}
          className="min-h-64 resize-y"
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 grid gap-4">
      <div className="space-y-2">
        <Label>
          {platform === "instagram_reel" || platform === "facebook_reel"
            ? "Reel caption"
            : "Instagram caption"}
        </Label>
        <Textarea
          value={content.instagramCaption}
          onChange={(event) => onChange("instagramCaption", event.target.value)}
          className="min-h-52 resize-y"
        />
        {platform === "instagram_photo" && (
          <p className="text-xs leading-5 text-muted-foreground">
            Instagram keeps caption URLs as plain text. Use Facebook, Pinterest, LinkedIn, or X for
            clickable recipe links.
          </p>
        )}
      </div>
    </div>
  );
}
